<x-layout>

    <div class="max-w-3xl mx-auto">

        <div class="card bg-zinc-950 border border-zinc-800 shadow-2xl">

            <div class="card-body">

                <h1 class="text-3xl font-black text-yellow-400 mb-2">
                    💡 Create New Idea
                </h1>

                <p class="text-zinc-400 mb-6">
                    Every great product starts with a single idea.
                </p>

                <form action="/ideas" method="POST">
                    @csrf
                    <textarea
                        name="description"
                        rows="6"
                        placeholder="Write your next big idea..."
                        class="textarea textarea-bordered w-full bg-zinc-900 text-white border-zinc-700 focus:border-yellow-500">{{ old('description') }}</textarea>

                    <x-forms.error name="description" />

                    <div class="flex justify-end gap-3 mt-6">

                        <a href="/ideas"
                            class="btn btn-outline">
                            Cancel
                        </a>

                        <button
                            type="submit"
                            class="btn btn-warning">
                            🚀 Save Idea
                        </button>

                    </div>

                </form>

            </div>

        </div>

    </div>

</x-layout>
