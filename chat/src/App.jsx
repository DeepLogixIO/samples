import {Box, IconButton, Paper, TextField, Typography} from "@mui/material";
import SendIcon from '@mui/icons-material/Send';
import ChatMessage from "./components/ChatMessage.jsx";
import {useState} from "react";

function App() {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      content: "Hey! I'm a Llama3.2:3B. You can ask me any question.",
      role: "assistant",
    },
  ]);

  const handleSend = async () => {
    setLoading(true)
    const userMessage = {role: "user", content: userInput};
    setMessages(prev => [...prev, userMessage]);
    setUserInput("");
    try {
      const response = await fetch(`${import.meta.env.VITE_DEEPLOGIX_DISPATCHER_URL}/ollama/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': import.meta.env.VITE_DEEPLOGIX_TOKEN,
        },
        body: JSON.stringify({
          model: "llama3.2:3b",
          messages: [...messages, userMessage],
          stream: true,
        })
      });

      if (!response.ok || !response.body) {
        console.error("Failed to stream response");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      let content = "";
      let assistantMessage = {role: "assistant", content: ""};
      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const {done, value} = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, {stream: true});

        const lines = chunk.split("\n").filter(line => line.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            const delta = parsed.message.content;
            content += delta;

            setMessages(prev => {
              const updated = [...prev];
              const lastIndex = updated.length - 1;
              if (updated[lastIndex].role === "assistant") {
                updated[lastIndex] = {
                  ...updated[lastIndex],
                  content: content + " &#9608;",
                };
              }
              return updated;
            });
          } catch (err) {
            console.error(err);
          }
        }
      }
      setMessages(prev => [...prev.slice(0, prev.length - 1), {...prev[prev.length - 1], content}]);
    } finally {
      setLoading(false);
    }
  };


  return (
    <Box
      display="flex"
      justifyContent="center"
    >
      <Box>
        <Typography component={'h5'} variant="h5">
          Deeplogix Llama Chat
        </Typography>
        <Box
          width={500}
          px={'12px'}
          py={'8px'}
          sx={{
            bgcolor: 'grey.100',
            borderRadius: 2,
          }}
        >
          <Box>
            {messages.map((message, index) => (
              <ChatMessage key={index} content={message.content} role={message.role}/>
            ))}
          </Box>
          <Paper
            component="form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: '4px 8px',
              borderRadius: '24px',
              bgcolor: 'background.paper',
              boxShadow: 1,
            }}
          >
            <TextField
              variant="standard"
              placeholder="Type your message..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              fullWidth
              sx={{mx: 1}}
            />
            <IconButton
              type="submit"
              color="primary"
              disabled={!userInput || messages[messages.length - 1]?.role === 'user' || loading}
            >
              <SendIcon/>
            </IconButton>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default App
