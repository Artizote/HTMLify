
const frame = document.getElementById("frame");
var frames = [];
var current = 0;

function setframe(){
    currentframe = frames[current];
    if (currentframe==undefined)
        currentframe = frames[current+1];
    frame.setAttribute("src", currentframe.url);
    document.getElementById("user-dp").setAttribute("src", "/media/dp/"+currentframe.owner+".jpg");
    document.getElementById("user-dp").setAttribute("title", currentframe.owner);
    document.getElementById("user-dp").setAttribute("alt", currentframe.owner);
    document.getElementById("profile-link").setAttribute("href", "/"+currentframe.owner);
    document.getElementById("profile-link").innerText = currentframe.owner;
    document.getElementById("title").textContent = currentframe.title;
    document.getElementById("view-count").innerHTML = currentframe.viewcount;
    document.getElementById("comment-count").innerHTML = currentframe.commentcount;
}

function showcomments(){
    currentframe = frames[current];
    frame.setAttribute("src", "/src/"+currentframe.url+"#comment-text-field");
}

function frameup(){
    if (current > 0){
        current -= 1;
        setframe();
    }
}

function framedown(){
    if (current === frames.length - 1)
        fetchframes();
    current += 1;
    setframe();
}

function fetchframes() {
    fetch('/frames/feed')
        .then(response => {
                if (!response.ok) {
                throw new Error('Network response was not ok');
                }
                return response.json();
                })
    .then(data => {
            if (data.error) {
            document.write("<h1>Frames are not available</h1>");
            return;
            }
            data.feed.forEach(item => {
                    frames.push(item);
                    });
            })
    .catch(error => {
            console.error('Error fetching new content:', error);
            alert(error.message);
            fetchframes();
            });
}

function share(){
    let shortlink = frames[current].shortlink;
    navigator.clipboard.writeText(shortlink)
      .then(() => {
                alert("Link copied to clipboard!");
            })
      .catch((error) => {
              alert("Unable to copy text to clipboard:\nPlease mannualy copy link: " + shortlink, error);
            });
}

function openframeexternal() {
    let url = frames[current].url;
    window.open(url).focus();
}

fetchframes();
setTimeout(setframe, 200);

