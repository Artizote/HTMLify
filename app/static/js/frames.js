
const frame = document.getElementById("frame");
var frames = [];
var current = 0;

function setframe(){
    currentframe = frames[current];
    if (currentframe==undefined)
        currentframe = frames[current+1];
    frame.setAttribute("src", currentframe.url);
    document.getElementById("user-dp").setAttribute("src", "/dp/"+currentframe.username);
    document.getElementById("user-dp").setAttribute("title", currentframe.username);
    document.getElementById("user-dp").setAttribute("alt", currentframe.username);
    document.getElementById("profile-link").setAttribute("href", "/"+currentframe.username);
    document.getElementById("profile-link").innerText = currentframe.username;
    document.getElementById("title").textContent = currentframe.title;
    document.getElementById("view-count").innerHTML = currentframe.views;
    document.getElementById("comment-count").innerHTML = currentframe.comments;
}

function showcomments(){
    currentframe = frames[current];
    frame.setAttribute("src", "/src"+currentframe.path+"#comment-text-field");
}

function frameup(){
    if (current > 0){
        current -= 1;
        setframe();
    }
}

function framedown(){
    if (current === frames.length - 1) {
        fetchframes();
        setTimeout(() => {
            current += 1;
            setframe();
        }, 1000);
    } else {
        current += 1;
        setframe();
    }
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
    fetch(`http://api.${window.location.host}/shortlink?url=${frames[current].path}`)
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                alert("Errer in creating shortlink");
            } else {
                navigator.clipboard.writeText(data.shortlink.url)
                    .then(() => {
                        alert("Link copied to clipboard!");
                    })
                    .catch((error) => {
                        alert("Unable to copy text to clipboard:\nPlease mannualy copy link: " + shortlink, error);
                    });
            }
        });
}

function openframeexternal() {
    let url = frames[current].url;
    window.open(url).focus();
}

setTimeout(fetchframes, 200);
setTimeout(setframe, 1000);

