# Read Binary from C written from JavaScript

## JavaScript Binary File Exporting/Importing
Open the index.html, and write some employees. And then press "Export" button will downloads binary file that contains employee list.
Press import and select binary file that you just created to restore whole employee list. (Try after refresh the page).

## Run from C
I just wrote C as simple as possible, there is no data manipulation, just it reads.
I'm not a C programmer, so my grammar could be bad :(

Before run, you have to compile manage.c. If you have gcc, run:

```bash
gcc -o manage manage.c
```

Oh, don't forget to update file name and path. It requires Binary file that created from JavaScript.

```c
fp = fopen("./ee69728a-c08b-4630-9a9a-7f273d97e638", "rb");    // <- PUT YOUR FILE NAME INSTEAD OF ee blabla
```

Now run C:

```bash
./manage
```

You will have same data as your browser got.