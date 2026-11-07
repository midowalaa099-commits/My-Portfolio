<div class="container mx-auto flex items-center py-4">
    <a href="/ideas"
        class="text-3xl font-black tracking-wide text-yellow-400">
        🦇 IDEA CAVE
    </a>

    <div class="ml-auto flex gap-2">
        @guest
        <a href="/register"
            class="btn btn-outline border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black">
            Register
        </a>

        <a href="/login"
            class="btn btn-ghost text-gray-300 hover:text-white">
            Login
        </a>
        @endguest

        @auth
        <form method="POST" action="/logout">
            @csrf
            @method('DELETE')
            <button type="submit" class="btn btn-ghost text-gray-300 hover:text-white">
                Logout
            </button>
        </form>
        <a href="/ideas/create"
            class="btn bg-yellow-500 hover:bg-yellow-400 border-0 text-black font-bold">
            + New Idea
        </a>
        @can('admin')
        <a href="/admin"
            class="btn bg-yellow-500 hover:bg-yellow-400 border-0 text-black font-bold">
            Admin
        </a>
        @endcan
        @endauth
    </div>

</div>
