from flask import request, render_template, redirect

from app.models import ShortLink
from .public import public


@public.route("/r/", methods=["GET", "POST"])
def link_shortener():
    shorted = url = None
    hits = None
    if request.method == "POST":
        url = request.form.get("url")
        if not url:
            return render_template("link-shortener.html")
        shortlink = ShortLink.create(url)
        hits = shortlink.visits
        shorted = shortlink.short
    return render_template("link-shortener.html", shorted=shorted, hits=hits, url=url)


@public.route("/r/<shortcode>")
def shortlink_rediraction(shortcode):
    shortlink = ShortLink.by_short(shortcode)
    if not shortlink:
        return redirect("/r")
    shortlink.hit()
    return redirect(shortlink.href, 302)

