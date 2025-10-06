document.addEventListener('DOMContentLoaded', () => {
    const processButton = document.getElementById("process-button");
    const logOutput = document.getElementById("log-output");

    processButton.addEventListener("click", async () => {
        logOutput.textContent = "Processing started...\n";
        processButton.disabled = true;
        try {
            const response = await fetch("/process-sheets", {method : "POST"});
            const result = await response.text();
            logOutput.textContent += `${result}\n`;
        } catch (error) {
            logOutput.textContent += `Error: ${error.message}\n`;
        } finally {
            processButton.disabled = false;
        }
    })
});