from flask import request, send_from_directory, Flask, abort
app = Flask(__name__, static_url_path='')

@app.route('/api/tweet', methods=['POST'])
def tweet():
    text = request.form.get("text", None)
    if text is not None:
        print(text)
        return "Got %r" % text
    else:
        return abort(400)

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

if __name__ == "__main__":
    app.run()