const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { execSync } = require("child_process");

const reportPath = path.join(__dirname, "../test-results/report.json");
const errorContextDir = path.join(__dirname, "../test-results");
const testDir = path.join(__dirname, "../src/tests");
const apiUrl = "http://localhost:8000/classifyTestFailure";
const selfHealUrl = "http://localhost:8000/selfHealTest";

async function main() {
  if (!fs.existsSync(reportPath)) {
    console.error("No Playwright JSON report found.");
    process.exit(1);
  }
  const report = JSON.parse(fs.readFileSync(reportPath, "utf-8"));
  const failures = (report.suites || [])
    .flatMap((suite) =>
      (suite.specs || []).flatMap((spec) =>
        (spec.tests || [])
          .filter(
            (test) =>
              test.status === "failed" ||
              test.status === "unexpected" ||
              test.status === "timedOut"
          )
          .map((test) => {
            const result = (test.results && test.results[0]) || {};
            const error =
              (result.errors && result.errors[0]) || result.error || {};
            const error_message =
              (error.message ? error.message : JSON.stringify(error)) ||
              "Unknown error";
            const safeTitle = spec.title.replace(/[^a-zA-Z0-9-_]/g, "_");
            const htmlPath = path.join(
              errorContextDir,
              `${safeTitle}-failed.html`
            );
            const screenshotPath = path.join(
              errorContextDir,
              `${safeTitle}-failed.png`
            );
            let error_context = "";
            let screenshot = "";
            if (fs.existsSync(htmlPath)) {
              error_context = fs.readFileSync(htmlPath, "utf-8");
            }
            if (fs.existsSync(screenshotPath)) {
              screenshot = fs.readFileSync(screenshotPath, {
                encoding: "base64",
              });
            }
            const testFilePath = path.join(testDir, spec.file);
            const test_code = extractTestCode(testFilePath, spec.title);

            // Try to include error-context.md if it exists
            let error_context_md = "";
            const errorContextMdPath = path.join(
              errorContextDir,
              // Try to find a subdirectory for this test (e.g., generated-test-tests)
              fs.existsSync(
                path.join(errorContextDir, `${safeTitle}-failed.html`)
              )
                ? ""
                : fs
                    .readdirSync(errorContextDir)
                    .find((d) =>
                      fs.existsSync(
                        path.join(errorContextDir, d, "error-context.md")
                      )
                    ) || "",
              "error-context.md"
            );
            if (fs.existsSync(errorContextMdPath)) {
              error_context_md = fs.readFileSync(errorContextMdPath, "utf-8");
            }

            return {
              test_name: spec.title,
              error_message,
              error_context,
              screenshot,
              test_code,
              error_context_md,
              test_file_path: testFilePath,
            };
          })
      )
    )
    .flat();

  for (const failure of failures) {
    try {
      const res = await axios.post(apiUrl, failure);
      console.log(
        `Test: ${failure.test_name}\nClassification: ${res.data.classification}\n`
      );

      if (res.data.classification === "self-heal") {
        console.log("Attempting to self-heal test:", failure.test_name);
        const healRes = await axios.post(selfHealUrl, failure);

        console.log("Heal response:", healRes.data);

        if (healRes.data.fixed_code) {
          console.log("Received fixed code:", healRes.data.fixed_code);
          console.log("Updating test file...");
          await updateTestFile(
            failure.test_file_path,
            failure.test_name,
            healRes.data.fixed_code
          );

          console.log("Running tests again to verify fix...");
          try {
            execSync("npx playwright test src/tests", { stdio: "inherit" });
            console.log("Self-healing successful! Test now passes.");
          } catch (error) {
            console.error("Self-healing failed. Test still fails after fix.");
            // Optionally, we could revert the changes here
          }
        }
      }
    } catch (err) {
      console.error(
        `Failed to process test: ${failure.test_name}`,
        err.message
      );
    }
  }
}

async function updateTestFile(filePath, testName, newCode) {
  try {
    // Create backup of original file
    const backupPath = `${filePath}.bak`;
    fs.copyFileSync(filePath, backupPath);

    // Write the new code directly to the file
    fs.writeFileSync(filePath, newCode);

    console.log(`Updated test file: ${filePath}`);
  } catch (error) {
    console.error("Error updating test file:", error);
    throw error;
  }
}

function extractTestCode(testFilePath, testTitle) {
  if (!fs.existsSync(testFilePath)) return "";
  const fileContent = fs.readFileSync(testFilePath, "utf-8");
  const lines = fileContent.split("\n");
  const startRegex = new RegExp(
    `test\\(['"\`].*${escapeRegExp(testTitle)}.*['"\`]`
  );
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (startRegex.test(lines[i])) {
      start = i;
      break;
    }
  }
  if (start === -1) return "";
  // Now, find the closing });
  let openBraces = 0;
  let end = start;
  for (let i = start; i < lines.length; i++) {
    openBraces += (lines[i].match(/{/g) || []).length;
    openBraces -= (lines[i].match(/}/g) || []).length;
    if (openBraces === 0 && i > start) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end + 1).join("\n");
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

main();
