<x-layout>
    <div class="flex justify-between items-center mb-8">

        <div>
            <h1 class="text-4xl font-black text-yellow-400">
                🦇 Idea Cave
            </h1>

            <p class="text-zinc-400 mt-2">
                Capture your best ideas before they disappear.
            </p>
        </div>

        <a href="/ideas/create"
            class="btn bg-yellow-500 hover:bg-yellow-400 text-black border-0 font-bold">
            + Create Idea
        </a>

    </div>

    <div class="grid md:grid-cols-2 gap-6">

        @foreach($ideas as $idea)

        <div class="card bg-zinc-950 border border-zinc-800 shadow-xl hover:border-yellow-500 hover:shadow-yellow-500/20 transition-all duration-300">

            <div class="card-body">

                <div class="flex justify-between items-center">

                    <h2 class="card-title text-yellow-400">
                        💡 Idea #{{ $idea->id }}
                    </h2>

                    <span class="badge badge-warning">
                        {{ $idea->state }}
                    </span>

                </div>

                <p class="text-zinc-300 break-words">
                    {{ $idea->description }}
                </p>

                <div class="card-actions justify-end mt-4">

                    <a href="/ideas/{{ $idea->id }}"
                        class="btn btn-sm btn-outline">
                        View
                    </a>

                    <a href="/ideas/{{ $idea->id }}/edit"
                        class="btn btn-sm btn-warning">
                        Edit
                    </a>

                </div>

            </div>

        </div>

        @endforeach

    </div>

    @if($ideas->isEmpty())

    <div class="text-center py-20">

        <div class="text-7xl mb-4">
            🦇
        </div>

        <h2 class="text-2xl font-bold text-zinc-300">
            No Ideas Yet
        </h2>

        <p class="text-zinc-500 mt-2">
            Start by creating your first brilliant idea.
        </p>

    </div>

    @endif

</x-layout>
