from flask import Flask, request
import requests
import justext
import json

app = Flask(__name__)

def getTitle(html):
    temp = html.decode("utf-8").split("<title", 1)[1]
    temp = temp.split(">", 1)[1]
    title = temp.split("</title>", 1)[0]
    return title

@app.route('/extract')
def hello_world():
    url = request.args.get('url')
    response = requests.get(url)

    paragraphs = justext.justext(response.content, justext.get_stoplist("English"))
    realText = ""

    for paragraph in paragraphs:
        if not paragraph.is_boilerplate:
            realText += paragraph.text
            realText += "\n\n"
    outputObj = {
        "content": realText,
        "source": url,
        "title": getTitle(response.content)
    }
    outputJson = json.dumps(outputObj)
    return outputJson
app.run()
