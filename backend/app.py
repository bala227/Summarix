from flask import Flask, request, jsonify
from newspaper import Article
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
import nltk

app = Flask(__name__)

# Download necessary NLTK resources once at startup
nltk.download('punkt')
nltk.download('punkt_tab')

import logging

@app.route('/summarize', methods=['POST'])
def summarize_article():
    data = request.json
    url = data.get('url')
    app.logger.info(f"Received URL: {url}")

    if not url:
        return jsonify({'error': 'URL is required'}), 400

    try:
        article = Article(url)
        app.logger.info("Downloading article...")
        article.download()
        article.parse()
        app.logger.info("Article downloaded and parsed")

        parser = PlaintextParser.from_string(article.text, Tokenizer("english"))
        summarizer = LsaSummarizer()
        summary = summarizer(parser.document, 10)
        summary_text = ' '.join([str(sentence) for sentence in summary])
        app.logger.info("Summary generated")

        return jsonify({
            'title': article.title,
            'summary': summary_text,
            'image': article.top_image
        })

    except Exception as e:
        app.logger.error(f"Error in summarizing article: {str(e)}")
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True)
