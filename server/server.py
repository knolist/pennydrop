from flask import Flask, request
import requests
import justext
import json
import torch
from transformers import DistilBertTokenizer, DistilBertForQuestionAnswering# BertTokenizer, BertForQuestionAnswering
import time

app = Flask(__name__)


def startTimer():
    return time.time()
def endTimer(timer):
    print("--- %s seconds ---" % (time.time() - timer))

def getTitle(html):
    temp = html.decode("utf-8", errors='ignore').split("<title", 1)[1]
    temp = temp.split(">", 1)[1]
    title = temp.split("</title>", 1)[0]
    return title

@app.route('/extract')
def extract():
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
        "title": getTitle(response.content),
        "highlights": [],
        "notes": []
    }
    outputJson = json.dumps(outputObj)
    return outputJson

tokenizer = DistilBertTokenizer.from_pretrained('distilbert-base-cased')
model = DistilBertForQuestionAnswering.from_pretrained('distilbert-base-cased')
@app.route('/bertSimilarity')
def bertQuestionAnswer():
    timer = startTimer()
    question, text = request.args.get('question'), request.args.get('text')
    input_ids = tokenizer.encode(question, text, max_length=512)
    start_scores, end_scores = model(torch.tensor(input_ids).unsqueeze(0))
    endTimer(timer)

    all_tokens = tokenizer.convert_ids_to_tokens(input_ids)
    print(torch.argmax(start_scores))
    print(torch.argmax(end_scores))
    answer = ' '.join(all_tokens[torch.argmax(start_scores) : torch.argmax(end_scores)+1])
    return json.dumps([answer, torch.max(start_scores).item(), torch.max(end_scores).item()])

app.run()
