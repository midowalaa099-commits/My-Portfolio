import { normalizeAmount } from './bank.ts';
import type { PendingOperation, Session, Transaction } from './bank.ts';

export class ApiError extends Error {
    status: number;
    errors: Record<string, string[]>;
    applicationResponse: boolean;
    constructor(
        message: string,
        status = 0,
        errors: Record<string, string[]> = {},
        applicationResponse = false,
    ) {
        super(message);
        this.status = status;
        this.errors = errors;
        this.applicationResponse = applicationResponse;
    }
}
export async function request<T>(
    path: string,
    token?: string,
    body?: unknown,
    key?: string,
): Promise<T> {
    let response: Response;
    try {
        response = await fetch(`/api/v1${path}`, {
            method: body === undefined ? 'GET' : 'POST',
            headers: {
                Accept: 'application/json',
                ...(body === undefined
                    ? {}
                    : { 'Content-Type': 'application/json' }),
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(key ? { 'Idempotency-Key': key } : {}),
            },
            body: body === undefined ? undefined : JSON.stringify(body),
            credentials: 'omit',
            cache: 'no-store',
            signal: AbortSignal.timeout(20000),
        });
    } catch {
        throw new ApiError(
            'We couldn’t reach the bank. Check your connection and try again.',
        );
    }
    if (response.status === 401 && token) {
        window.dispatchEvent(
            new CustomEvent('bank:session-expired', { detail: token }),
        );
    }
    if (response.status === 204) return undefined as T;
    let result;
    try {
        result = await response.json();
    } catch {
        throw new ApiError(
            'The bank returned an unexpected response. Please try again.',
            response.ok ? 0 : response.status,
        );
    }
    if (!result || typeof result !== 'object' || Array.isArray(result)) {
        throw new ApiError(
            'The bank returned an unexpected response. Please try again.',
            response.ok ? 0 : response.status,
        );
    }
    if (!response.ok) {
        const message =
            response.status === 429
                ? 'A little too fast. Please wait a minute and try again.'
                : response.status >= 500
                  ? 'The bank is temporarily unavailable. Please try again.'
                  : typeof result.message === 'string'
                    ? result.message
                    : 'Something went wrong. Please try again.';
        throw new ApiError(
            message,
            response.status,
            result.errors || {},
            response.headers.get('X-Bank-Rejection') === '1',
        );
    }
    return result as T;
}
export function errorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Something went wrong. Please try again.';
}
export function readSession(): Session | null {
    try {
        const value = JSON.parse(
            sessionStorage.getItem('mvp-bank.session') || 'null',
        );
        if (
            typeof value?.access_token === 'string' &&
            value.access_token.length > 0 &&
            Number.isSafeInteger(value?.user?.id) &&
            value.user.id > 0 &&
            typeof value.user.name === 'string' &&
            typeof value.user.email === 'string' &&
            ['customer', 'admin'].includes(value.user.role) &&
            typeof value.expires_at === 'string' &&
            Date.parse(value.expires_at) > Date.now()
        )
            return value;
    } catch {
        /* Unavailable or invalid browser storage starts a fresh session. */
    }
    return null;
}
export function saveSession(session: Session | null): void {
    if (session)
        sessionStorage.setItem('mvp-bank.session', JSON.stringify(session));
    else sessionStorage.removeItem('mvp-bank.session');
}
export function readPending(
    userId: number,
): PendingOperation | 'unreadable' | null {
    try {
        const stored = sessionStorage.getItem(`mvp-bank.pending.${userId}`);
        if (stored === null) return null;
        const value = JSON.parse(stored);
        return validPending(value) ? value : 'unreadable';
    } catch {
        return 'unreadable';
    }
}

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validPending(value: unknown): value is PendingOperation {
    if (!value || typeof value !== 'object') return false;
    const operation = value as Partial<PendingOperation>;
    if (
        typeof operation.account !== 'string' ||
        !uuid.test(operation.account) ||
        typeof operation.currency !== 'string' ||
        !/^[A-Z]{3}$/.test(operation.currency) ||
        !['deposit', 'withdrawal', 'transfer'].includes(operation.kind || '') ||
        typeof operation.key !== 'string' ||
        !/^[A-Za-z0-9._:-]{1,128}$/.test(operation.key) ||
        typeof operation.body?.amount !== 'string'
    )
        return false;
    try {
        normalizeAmount(operation.body.amount);
    } catch {
        return false;
    }
    return operation.kind === 'transfer'
        ? typeof operation.body.destination_account === 'string' &&
              uuid.test(operation.body.destination_account)
        : operation.body.destination_account === undefined;
}

export function definitiveMoneyRejection(error: unknown): error is ApiError {
    return (
        error instanceof ApiError &&
        error.applicationResponse &&
        (error.status === 409 || error.status === 422)
    );
}

export async function submitMoneyOperation(
    session: Session,
    operation: PendingOperation,
): Promise<Transaction> {
    if (!validPending(operation))
        throw new Error('The saved operation needs review before it can be retried.');
    try {
        savePending(session.user.id, operation);
    } catch {
        throw new Error(
            'Browser storage is unavailable. No new money request was sent. Restore storage access and retry.',
        );
    }
    const endpoints = {
        deposit: 'deposits',
        withdrawal: 'withdrawals',
        transfer: 'transfers',
    };
    try {
        const result = await request<{ data: Transaction }>(
            `/accounts/${encodeURIComponent(operation.account)}/${endpoints[operation.kind]}`,
            session.access_token,
            operation.body,
            operation.key,
        );
        const receipt = result?.data;
        const expectedSource = operation.kind === 'deposit' ? null : operation.account;
        const expectedDestination = operation.kind === 'withdrawal'
            ? null
            : operation.kind === 'deposit' ? operation.account : operation.body.destination_account;
        if (
            !receipt ||
            typeof receipt.reference !== 'string' ||
            !uuid.test(receipt.reference) ||
            receipt.type !== operation.kind ||
            receipt.currency !== operation.currency ||
            typeof receipt.amount !== 'string' ||
            receipt.amount !== normalizeAmount(operation.body.amount) ||
            typeof receipt.created_at !== 'string' ||
            !Number.isFinite(Date.parse(receipt.created_at)) ||
            (receipt.source_account !== null && typeof receipt.source_account !== 'string') ||
            (receipt.destination_account !== null && typeof receipt.destination_account !== 'string') ||
            receipt.source_account?.toLowerCase() !== expectedSource?.toLowerCase() ||
            receipt.destination_account?.toLowerCase() !== expectedDestination?.toLowerCase()
        )
            throw new ApiError('The bank returned an unexpected receipt. Retry the original operation safely.');
        savePending(session.user.id, null);
        return receipt;
    } catch (error) {
        if (definitiveMoneyRejection(error)) savePending(session.user.id, null);
        throw error;
    }
}
export function savePending(
    userId: number,
    operation: PendingOperation | null,
): void {
    if (operation)
        sessionStorage.setItem(
            `mvp-bank.pending.${userId}`,
            JSON.stringify(operation),
        );
    else sessionStorage.removeItem(`mvp-bank.pending.${userId}`);
}

export function resolveUnreadablePending(
    userId: number,
    confirmResolution: () => boolean,
): boolean {
    if (readPending(userId) !== 'unreadable' || !confirmResolution()) return false;
    savePending(userId, null);
    return true;
}
