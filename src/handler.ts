process.on("unhandledRejection", (error: Error) => {
    console.error(`unhandledRejection ${error.message}`, {
        stack: error.stack
    })
});

process.on("uncaughtException", (error: Error) => {
    console.error(`uncaughtException ${error.message}`, {
        stack: error.stack
    })
});
