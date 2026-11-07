<x-layout>

    <div class="max-w-3xl mx-auto">

        <div class="card bg-zinc-950 border border-zinc-800 shadow-2xl">

            <div class="card-body">

                <h1 class="text-3xl font-black text-yellow-400 mb-4">
                    ✏️ Edit Idea
                </h1>

                <form action="/ideas/{{ $idea->id }}" method="POST">

                    @csrf
                    @method('PATCH')

                    <textarea
                        name="description"
                        rows="6"
                        class="textarea textarea-bordered w-full bg-zinc-900 text-white"
                    >{{ old('description', $idea->description) }}</textarea>

                    <x-forms.error name="description" />

                    <div class="flex justify-end gap-3 mt-4">

                        <a href="/ideas/{{ $idea->id }}"
                           class="btn btn-outline">
                            Cancel
                        </a>

                        <button
                            type="submit"
                            class="btn btn-warning">
                            Update Idea
                        </button>

                    </div>

                </form>

            </div>

        </div>

    </div>

</x-layout>
