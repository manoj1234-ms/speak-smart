import { ref } from 'vue';

const output = ref(null);
const error = ref(null);
const loading = ref(false);

const runJavascriptLocally = async (code) => {
    const logs = [];
    const originalLog = console.log;
    const originalError = console.error;

    try {
        // Intercept console.log to capture output
        console.log = (...args) => {
            logs.push(args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '));
        };
        console.error = (...args) => {
            logs.push("Error: " + args.map(a => String(a)).join(' '));
        };

        // Use new Function to execute code in a slightly cleaner scope
        // strictly speaking this is still running in the window context
        // Wrap in IIFE to avoid polluting global scope too much
        const func = new Function(code);
        func();

        return {
            stdout: logs.join('\n'),
            stderr: null
        };
    } catch (e) {
        return {
            stdout: logs.join('\n'),
            stderr: e.toString()
        };
    } finally {
        // Restore console
        console.log = originalLog;
        console.error = originalError;
    }
};

const runWithWandbox = async (code, language) => {
    let compiler = 'gcc-12.2.0'; // Default to a stable GCC version
    let options = '';

    if (language === 'python') {
        compiler = 'cpython-3.10.2';
    } else if (language === 'cpp' || language === 'c++') {
        compiler = 'gcc-12.2.0';
        options = 'warning,gnu++20'; // Standard modern C++ options
    }

    const body = {
        code: code,
        compiler: compiler,
        save: false
    };

    // Only add options if defined (crucial for Python not to fail)
    if (options) {
        body.options = options;
    }

    try {
        const response = await fetch('https://wandbox.org/api/compile.json', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error(`Execution Provider Error: ${response.status}`);
        }

        const data = await response.json();

        const stdout = (data.program_message || data.compiler_message || '').trim();
        const stderr = (data.program_error || data.compiler_error || '').trim();

        // If status is not 0 (failure) and we have no stderr, check stdout or generic
        if (data.status != "0" && !stderr && !stdout) {
            return { stdout: "", stderr: "Process exited with errors (Code " + data.status + ")" };
        }

        return { stdout, stderr };

    } catch (e) {
        console.error("Wandbox fetch failed", e);
        throw new Error("Remote execution failed. Try JavaScript (Local Mode) locally.");
    }
};

const runCode = async (code, language) => {
    if (!code) return null;
    loading.value = true;
    output.value = null;
    error.value = null;

    let result = null;

    try {
        if (language === 'javascript') {
            console.log("[useCodeRunner] Running JavaScript locally...");
            result = await runJavascriptLocally(code);
        } else {
            console.log(`[useCodeRunner] Running ${language} via Wandbox...`);
            // Note: Wandbox API usually works with CORS, but if it fails, we fall back
            result = await runWithWandbox(code, language);
        }

        if (result) {
            output.value = result.stdout;
            error.value = result.stderr;

            return {
                stdout: result.stdout,
                stderr: result.stderr
            };
        }
    } catch (err) {
        error.value = err.message;
        return null;
    } finally {
        loading.value = false;
    }
};

export function useCodeRunner() {
    return {
        output,
        error,
        loading,
        runCode
    };
}
