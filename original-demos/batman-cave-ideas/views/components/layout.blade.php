<!DOCTYPE html>
<html lang="en" data-theme="night">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $title ?? 'Ideas App' }}</title>

    <link href="https://cdn.jsdelivr.net/npm/daisyui@5" rel="stylesheet" />
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
</head>

<body class="min-h-screen bg-black text-gray-200">
    <div class="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_35%)]"></div>
    <x-nav></x-nav>
    <!-- Main Content -->
<main class="container mx-auto max-w-5xl px-8 py-12">
    
        <div class="rounded-3xl bg-zinc-900 border border-zinc-800 shadow-[0_0_60px_rgba(0,0,0,.8)]">

            <div class="p-8">

                {{ $slot }}

            </div>

        </div>

    </main>

    <!-- Footer -->
    <footer class="text-center text-zinc-500 py-10 border-t border-zinc-900">

        🦇 Built in the Batcave with Laravel

    </footer>
</body>

</html>
