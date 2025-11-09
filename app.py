import os
import google.generativeai as genai
from flask import Flask, request, jsonify

app = Flask(__name__)

# Configure the Google Gemini API with your key
genai.configure(api_key=os.environ.get("GOOGLE_API_KEY", "AIzaSyAVvyFPnbCX6ZmUpG78ofgnt1yp3yRfmz0"))

# Define a system prompt for the interview
system_prompt = """
You are a panel of four interviewers for a Data Science and AI role.
Your names are Alice, Bob, Charlie, and Diana.
You will ask questions one by one, and provide brief, specific feedback on the user's answers.

Follow these rules strictly:
1. Start the conversation with a greeting and a technical question.
2. After each user answer, give brief but specific feedback (1-2 sentences).
3. Then, ask the next question, maintaining the persona of the current interviewer.
4. Each interviewer (Alice, Bob, Charlie, Diana) should ask one question in order.
5. All questions must be related to Artificial Intelligence or Data Science.
6. The final response should be just the question, not the feedback.
7. Your output should be a single text string containing both the feedback and the next question, formatted clearly.
   Example: "Great explanation of backpropagation. Bob, your turn. How would you handle missing data in a large dataset?"
"""

# Helper function to get AI response
def get_ai_response(history, user_input):
    model = genai.GenerativeModel('gemini-1.5-pro-latest', system_instruction=system_prompt)
    
    # We maintain the conversation history to give the AI context
    chat_session = model.start_chat(history=history)
    response = chat_session.send_message(user_input)
    return response.text, chat_session.history

# --- API Endpoints ---

@app.route('/start_interview', methods=['POST'])
def start_interview():
    # Initial prompt for the first question
    initial_prompt = "Hello. Let's begin the interview. Alice, please start."
    response, history = get_ai_response([], initial_prompt)
    
    # The first response from the AI will be the first question
    return jsonify({
        "question": response,
        "history": history
    })

@app.route('/process_answer', methods=['POST'])
def process_answer():
    data = request.json
    user_answer = data['userAnswer']
    history = data['history']
    
    # Get the AI's response with feedback and the next question
    ai_response, updated_history = get_ai_response(history, user_answer)

    return jsonify({
        "question": ai_response,
        "history": updated_history
    })

@app.route('/get_feedback', methods=['POST'])
def get_feedback():
    data = request.json
    history = data['history']
    
    # Send a prompt to the AI to get a final summary
    final_prompt = "The interview is over. Based on the conversation history, provide a final summary of the interviewee's performance, highlighting their strengths and weaknesses. The response should be in a JSON format with keys: 'summary', 'strengths', 'weaknesses'."

    model = genai.GenerativeModel('gemini-1.5-pro-latest')
    response = model.generate_content(final_prompt + str(history))
    
    # In a real app, you would parse the JSON here
    # For now, we'll return a placeholder
    return jsonify({
        "summary": "Your performance was strong, but could be improved by providing more detailed examples. Your communication skills were excellent.",
        "strengths": ["Clear communication", "Good foundational knowledge"],
        "weaknesses": ["Lacked specific project examples", "Responses were sometimes too brief"]
    })

if __name__ == '__main__':
    app.run(debug=True)