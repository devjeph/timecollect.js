document.addEventListener("DOMContentLoaded", () => {
    const processButton = document.getElementById("process-button");
    const logOutput = document.getElementById("log-output");

    processButton.addEventListener("click", async () => {
        logOutput.textContent = ""; // Clear previous logs
        processButton.disabled = true;
        
        // Establish a connection to the server for real-time logs
        const eventSource = new EventSource("/events");

        eventSource.onmessage = (event) => {
            logOutput.textContent += event.data + "\n";
            // Auto-scroll to the bottom of the log panel
            logOutput.scrollTop = logOutput.scrollHeight;
        };

        eventSource.onerror = (err) => {
            console.error("EventSource failed:", err);
            eventSource.close();
        };

        // Now, make the actual request to start the process
        try {
            const response = await fetch("/process-sheets", { method: "POST" });
            const result = await response.text();
            
            // The final message is handled by the event stream, but you could log it too
            console.log("Final response from server:", result);

        } catch (error) {
            logOutput.textContent += `Error: ${error.message}\n`;
        } finally {
            // The process is finished, so we can close the connection
            eventSource.close();
            processButton.disabled = false;
        }
    });
});