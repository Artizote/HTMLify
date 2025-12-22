from flask import request

from app.utils import escape_html
from app.models import User, File, Pen
from app.config import SCHEME, SERVER_NAME
from .public import public


@public.route("/robots.txt")
def robots_txt():
    return "\n".join([
        "User-agent: *",
        "Disallow: /r/",
        "Disallow: /raw/",
        "Disallow: /pastebin/",
        "Disallow: /tmp/",
        "Sitemap: " + SCHEME + "://" + SERVER_NAME + "/map/xml",
    ]), 200, {"Content-type": "text/text"}


@public.route("/map/")
def sitemap():
    return "\n".join([
        "<a href='xml'>xml sitemap</a></br>",
        "<a href='txt'>txt sitemap</a></br>",
        "<a href='html'>html sitemap</a></br>",
    ])


@public.route("/map/xml")
def xml_sitemap():
    site = SCHEME + "://" + SERVER_NAME
    xml = """<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n"""
    for user in User.select():
        xml += "<url>\n    <loc>" + site +"/"+ user.username + "</loc>\n</url>\n"
    for file in File.select():
        xml += "<url>\n    <loc>" + site + escape_html(file.path) + "</loc>\n</url>\n"
    for pen in Pen.select():
        xml += "<url>\n    <loc>" + site + escape_html(pen.path) + "</loc>\n</url>\n"
    xml += "</urlset>"
    return xml, { "Content-Type": "text/xml" }


@public.route("/map/txt")
def txt_sitemap():
    site = SCHEME + "://" + SERVER_NAME
    txt = ""
    for user in User.select():
        txt += site + "/" + user.username + "\n"
    for file in File.select():
        txt += site + file.path + "\n"
    for pen in Pen.select():
        txt += site + pen.path + "\n"
    if txt and txt[-1] == "\n":
        txt = txt[:-1]
    return txt, { "Content-Type": "text/txt" }


@public.route("/map/html")
def html_sitemap():
    site = request.scheme + "://" + request.host
    html = ""
    for user in User.select():
        html += "<a href=\"" + site + "/" + user.username + "\">" + site + "/" + user.username + "</a><br>"
    for file in File.select():
        html += "<a href=\"" + site + file.path + "\">" + site + file.path + "</a><br>"
    for pen in Pen.select():
        html += "<a href=\"" + site + pen.path + "\">" + site + pen.path + "</a><br>"
    return html

