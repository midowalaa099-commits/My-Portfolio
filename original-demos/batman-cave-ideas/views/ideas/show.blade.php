<x-layout>
    <div class="max-w-3xl mx-auto">

        <div class="card bg-zinc-950 border border-zinc-800 shadow-2xl">

            <div class="card-body">

                <div class="flex justify-between items-center">

                    <h1 class="text-3xl font-black text-yellow-400">
                        💡 Idea #{{ $idea->id }}
                    </h1>

                    <span class="badge badge-warning">
                        {{ $idea->state }}
                    </span>

                </div>

                <div class="divider"></div>

                <p class="text-xl text-zinc-200 leading-9 bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                {{ $idea->description }}
                </p>

                <div class="divider"></div>

                <div class="flex gap-3 justify-end">

                    <a href="/ideas"
                        class="btn btn-outline">
                        ← Back
                    </a>

                    <a href="/ideas/{{ $idea->id }}/edit"
                        class="btn btn-warning">
                        ✏️ Edit
                    </a>

                    <form action="/ideas/{{ $idea->id }}" method="POST">

                        @csrf
                        @method('DELETE')

                        <button
                            class="btn btn-error"
                            onclick="return confirm('Delete this idea?')">

                            🗑 Delete

                        </button>

                    </form>

                </div>

            </div>

        </div>

    </div>

</x-layout>
