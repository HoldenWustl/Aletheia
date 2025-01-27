from flask import Flask, render_template, request, jsonify, url_for
import newspaper

from flask_cors import CORS
import nltk
import openai
from dotenv import load_dotenv
import sys
import os
import time
sys.path.append(os.path.join(os.path.dirname(__file__), "OpenFactVerification"))
from factcheck import FactCheck
from newspaper.google_news import GoogleNewsSource
import feedparser
import requests
from googlenewsdecoder import gnewsdecoder
from bs4 import BeautifulSoup

load_dotenv()

serper_key = os.getenv("SERPER_API_KEY")
openai_key = os.getenv("OPENAI_API_KEY")
print("Serper Key:", serper_key)
print("OpenAI Key:", openai_key)
app = Flask(__name__)
CORS(app)

factcheck_instance = FactCheck()






# Route for serving your main HTML page
@app.route('/')
def index():
    return render_template('index.html')

# Your existing route to handle the POST request
@app.route('/extract-article', methods=['POST'])
def extract_article():
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({'error': 'No URL provided'}), 400

    try:
        article = newspaper.article(url)
        article.download()
        article.parse()
        authors = article.authors
        publish_date = article.publish_date
        text = article.text
        title = article.title
        paragraphs = text.split('\n\n')
        article.nlp()
        summary = article.summary
        summarySentences = [line.strip() for line in summary.split('\n') if line.strip()]
        top_image = article.top_image


        return jsonify({
            'authors': authors,
            'publish_date': publish_date.isoformat() if publish_date else None,
            'title': title,
            'summary': summarySentences,
            'text': paragraphs,
            'image': top_image
        })

    except Exception as e:
        return jsonify({'error': f'Failed to extract article: {str(e)}'}), 500



@app.route('/suggested-articles', methods=['GET'])
def suggested_articles():
    try:
        # Get the topic from query parameters (default to 'WORLD')
        topic = request.args.get('topic', 'WORLD').upper()

        # Define RSS feed URLs for topics
        topic_feeds = {
            'WORLD': "https://news.google.com/rss",
            'TECHNOLOGY': "https://news.google.com/rss/headlines/section/topic/TECHNOLOGY?hl=en-US&gl=US&ceid=US:en",
            'BUSINESS': "https://news.google.com/rss/headlines/section/topic/BUSINESS?hl=en-US&gl=US&ceid=US:en",
            'SPORTS': "https://news.google.com/rss/headlines/section/topic/SPORTS?hl=en-US&gl=US&ceid=US:en",
            'ENTERTAINMENT': "https://news.google.com/rss/headlines/section/topic/ENTERTAINMENT?hl=en-US&gl=US&ceid=US:en",
            'SCIENCE': "https://news.google.com/rss/headlines/section/topic/SCIENCE?hl=en-US&gl=US&ceid=US:en",
            'HEALTH': "https://news.google.com/rss/headlines/section/topic/HEALTH?hl=en-US&gl=US&ceid=US:en",
        }

        # Use the RSS feed URL based on the topic
        feed_url = topic_feeds.get(topic, topic_feeds['WORLD'])  # Default to 'WORLD' if topic not found
        feed = feedparser.parse(feed_url)

        article_urls = []

        for entry in feed.entries[:10]:  # Limit to 10 articles
            google_news_url = entry.link
            print(f"Resolving URL: {google_news_url}")

            # Use gnewsdecoder to decode the URL
            try:
                decoded_url = gnewsdecoder(google_news_url, interval=1)  # interval is optional
                if decoded_url.get("status"):
                    article_urls.append(decoded_url["decoded_url"])
                    print(f"Resolved Article URL: {decoded_url['decoded_url']}")
                else:
                    print(f"Error decoding URL {google_news_url}: {decoded_url.get('message')}")
                    article_urls.append(google_news_url)  # Fallback to original URL
            except Exception as e:
                print(f"Error occurred while decoding URL {google_news_url}: {e}")
                article_urls.append(google_news_url)  # Fallback to original URL

        return jsonify(article_urls)  # Return resolved article URLs as JSON

    except Exception as e:
        print(f"Error fetching suggested articles: {e}")
        return jsonify({'error': f'Failed to fetch suggested articles: {str(e)}'}), 500



@app.route('/process-sentence', methods=['POST'])
def process_sentence():
    # Parse the JSON request
    data = request.get_json()
    sentence = data.get('sentence', '')

    if not sentence:
        return jsonify({'error': 'No sentence provided'}), 400

    # Perform some processing (e.g., analysis, transformation, etc.)
    # For demonstration, we'll just reverse the sentence
    results = factcheck_instance.check_text(sentence)

    # Return the processed result as JSON
    return jsonify({'original': sentence, 'results': results})


    
if __name__ == '__main__':
    app.run(debug=True)