const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());

app.post('/run-cpp', (req, res) => {
    const cppCode = req.body.code;
    const testCases = req.body.testCases || []; // Array of test cases
    const uniqueId = uuidv4(); // Generate a unique identifier for each request

    const cppFileName = `temp_${uniqueId}.cpp`;

    // Save the C++ code to a file
    fs.writeFileSync(cppFileName, cppCode);

    // Compile the C++ code
    exec(`g++ ${cppFileName} -o temp_${uniqueId}`, (compileError, compileStdout, compileStderr) => {
        if (compileError) {
            return res.status(500).send({ error: `Compilation error: ${compileStderr}` });
        }

        // Run each test case and collect results
        let results = [];
        let promises = [];

        testCases.forEach((testCase, index) => {
            const inputFileName = `input_${uniqueId}_${index}.txt`;
            const expectedOutput = testCase.expectedOutput;

            // Save the input to a file
            fs.writeFileSync(inputFileName, testCase.input);

            // Run the compiled code with the provided input
            promises.push(new Promise((resolve) => {
                exec(`./temp_${uniqueId} < ${inputFileName}`, (runError, runStdout, runStderr) => {
                    let result = {
                        input: testCase.input,
                        expectedOutput: expectedOutput,
                        actualOutput: runStdout.trim(),
                        passed: runStdout.trim() === expectedOutput.trim()
                    };

                    results.push(result);
                    fs.unlinkSync(inputFileName); // Clean up input file
                    resolve();
                });
            }));
        });

        // Wait for all test cases to complete
        Promise.all(promises).then(() => {
            // Send results back to the frontend
            res.send({ results: results });

            // Clean up: remove generated files
            fs.unlinkSync(cppFileName);
            fs.unlinkSync(`temp_${uniqueId}`);
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
