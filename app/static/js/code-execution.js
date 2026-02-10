/* Code Execution */


class CodeExecution {

    constructor(code, executor, element=null) {
        this.ok = false;
        this.code = code;
        this.executor = executor;
        this.element = element;
        this.terminal = new Terminal();
        this.socket = io("/code-execution", { transports: ["websocket"] });

        this.ready = new Promise(resolve => {
            this.resolveReady = resolve;
        });

        this.setupExecution();
        this.setupSocket();
        this.setupTerminal();
    }

    async setupExecution() {
        await this.terminal.writeln("Creating Process");
        let ce = await publicApi.codeExecution.create(this.code, this.executor)
        if (ce.success) {
            await this.terminal.writeln("Process created");
            this.id = ce.code_execution.id;
            this.auth_code = ce.code_execution.auth_code;
            this.ok = true;
            this.resolveReady();
        } else {
            await this.terminal.writeln("Faild to create process");
            this.ok = false;
        }
    }

    setupSocket() {
        this.socket.on("started", async () => { await this.terminal.clear(); });
        this.socket.on("stream", (data) => {
            const uint8Array = new Uint8Array(data);
            this.terminal.write(uint8Array);
        });
    }

    setupTerminal() {
        this.terminal.onData(this.input);
        if (this.element) {
            this.terminal.open(this.element);
        }
    }

    join() {
        this.socket.emit("join", {
            id: this.id,
            auth_code: this.auth_code
        });
    }

    start() {
        this.socket.emit("start", {
            id: this.id,
            auth_code: this.auth_code
        });
    }

    input = (input) => {
        this.socket.emit("input", {
            id: this.id,
            auth_code: this.auth_code,
            input: input
        });
    }
}
