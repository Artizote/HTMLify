# Pubilc Routes


## /

Home route.

Currently feed of random or latest files.


## /dp/{username}

Route to serve User's profile picture (DP).

If user's DP is not available, get it from gravtar and save


## /{username}/

Same as the `/{path}/` folder's file list, but with some info about the user.


## /search

Search Page.

Interface to search Items, items including Flies and Pens


## /blob/

Interface for blob lookup by hash.


## /blob/{hash}

Route for serving blobs.

If blob is text response with Content-type header "text/text"
else with "application/octet-stream"


## /{path}

Route to serve files.

File's full path is the entire path in the URL, not only the part after `/`
if a no file exists with that path, check for the folder with that path,
if folder exists show a list of all files and folders in that folder.

Serving of the file can be different based on file's visibility and mode

---

### Modes

- **Render**
    Files with render mode served with tho Content-Type header based on the filename, rest is handled by browser.
- **Source**
    Files with source mode are intended to show source code/file and meta

---

### Visibility

- **Public**
    This is default visibility type, file with public visibility can be accessed by anyone by path
- **Hidden**
    Hidden files can only be accessed by the owner
- **Once**
    Files with Once visibility can only be consumed once, after that the visibility changed to Hidden

---

If file is locked, it will require password to consume the file


## /raw/{path}

Route to server file content in raw form.

Same accessibility as the `/{path}` but if the file's content is text, then will be served header Content-Type "text/text", else as the filename/mimetype.


## /src/{path}

Route to serve file content as the Source mode.

Same accessibility as the `/{path}` but as if the file has Render mode.


## /frames

Frames.

An interface to randomly browse HTML content which can be render, currently only consist of Files, in future Pens will be also included.


## /frames/feed

API for the Frames feed.

Randomly selected public HTML files in a JSON array.


## /frames/default

The default frame of the `/frames` page.

Will be removed.


## /pen/{id}

Route to serve pens.

If pen with the id `id` found, serve the constructed HTML.


## /pen/{id}/{part}

Route to serve parts of pen.

This route is for serving partial content of the pen,
the full HTML of pen is constructed at the time of serving,
for accessibility and future use, this route is made for getting the partial content.

The `{part}` case insensitive and can be one of them:

---

### Part
- **html**
    Full constructed HTML
- **head**
    Head content of the pen
- **body**
    Body content of the pen
- **css**
    CSS part of the pen
- **js**
    JS part of the pen


## /src/pen/{id}

Pen source.

Same as the `/src/{path}` but for pen, with source for each part, head, body, css and js.


## /raw/pen/{id}

Pen raw.

Pen's constructed HTML, but with header Content-Type "text/text"


## /r

ShortLink UI.

Interface for creating shortlinks from (long) URLs.

## /r/{short}

ShortLink Redirections.

302 redirection header based if shortlink found by the `{short}`.
302 redirection is done instead of 301 so browser don't auto redirect, and can count the hits,
we may change it to 301 in future.


## /tmp

TmpFlie Creation Page.

Interface to create temp files.

## /tmp/{code}

Route for serving temp file.

Serve temp file with the code `{code}`


## /tmp/f

Route for TmpFolder.

Interface to Crete, Retrieve temp folders.


## /tpm/f/{code}

Serving TmpFolder.

Route for serving temp folder by the code,
if the user is authenticated with the temp folder's auth code,
the user can also delete or upload files in that tempfolder.


## /robots.txt

robots.txt

Some route projection from bots and crawlers, and URL for XML sitemap


## /map

sitemaps.

Links in HTML of all sitemaps


## /map/xml

XML sitemap.

XML sitemap, consist of all files, guest files, pens, and users profile links.


## /map/txt

TXT sitemap.

TXT sitemap, list of all URLs same as XML sitemap, but in plaintext formate.


## /map/html

HTML sitemap.

HTML sitemap, list of all URLs same as XML sitemap, but as HTML links.

