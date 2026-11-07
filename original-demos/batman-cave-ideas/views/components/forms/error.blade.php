        @props(['name'=>'required '])
        
        @error($name)
        <p style="color: red;">
            {{ $message }}
        </p>
        @enderror
