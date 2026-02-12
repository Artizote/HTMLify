/* Code Execution */


class CodeExecution {

    constructor(code, executor, element=null, addons=[]) {
        this.ok = false;
        this.code = code;
        this.executor = executor;
        this.element = element;
        this.addons = addons;
        this.terminal = new Terminal({
            rows: 24,
            cols: 80,
            fontSize: 16,
            fontFamily: 'Courier New, monospace'
        });
        this.socket = io("/code-execution", { transports: ["websocket"] });

        this.ready = new Promise(resolve => {
            this.resolveReady = resolve;
        });

        this.setupExecution();
        this.setupSocket();
        this.setupAddons();
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

    setupAddons() {
        this.addons.forEach((addon) => {
            switch (addon) {
                case "fit":
                    this.fitAddon = new FitAddon.FitAddon();
                    break;
            }
        });
    }

    setupTerminal() {
        this.terminal.onData(this.input);
        if (this.element) {
            this.terminal.open(this.element);
        }
        this.addons.forEach((addon) => {
            switch (addon) {
                case "fit":
                    this.terminal.loadAddon(this.fitAddon);
                    this.fit();
                    break;
            }
        });
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

    resize(rows, cols) {
        this.socket.emit("resize", {
            id: this.id,
            auth_code: this.auth_code,
            rows: rows,
            cols: cols
        });
    }

    input = (input) => {
        this.socket.emit("input", {
            id: this.id,
            auth_code: this.auth_code,
            input: input
        });
    }

    fit() {
        // relies on fitAddon
        this.fitAddon.fit();
        this.resize(this.terminal.rows, this.terminal.cols);
    }
}
