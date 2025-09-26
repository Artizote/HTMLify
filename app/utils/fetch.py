from requests import get

def github_fetch(user, repo, branch, file):
    # uninmplimented function
    return NotImplemented
    #doing fetching with git clone command
    system("git clone https://github.com/" + user + "/" + repo + ".git media")
    with open("media/" + repo + "/" + file, 'r') as f:
        content = f.read()
    return content
    
def pastebin_fetch(id):
    return get("https://pastebin.com/raw/" + id.replace("/", "")[-8:]).text
