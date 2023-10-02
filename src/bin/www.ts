#!/usr/bin/env node

/**
 * Module dependencies.
 */

import * as http from "http";
import app from "../app";
import logger from "../logger";
import { NODE_PORT } from "../properties";

/**
 * Get port from environment and store in Express.
 */

app.set("port", NODE_PORT);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(NODE_PORT);
server.on("error", onError);

/**
 * Event listener for HTTP server "error" event.
 */

function onError (error) {
    if (error.syscall !== "listen") {
        throw error;
    }

    const bind = typeof NODE_PORT === "string"
        ? "Pipe " + NODE_PORT
        : "Port " + NODE_PORT;

    // handle specific listen errors with friendly messages
    switch (error.code) {
    case "EACCES":
        logger.error(bind + " requires elevated privileges");
        process.exit(1);
        break;
    case "EADDRINUSE":
        logger.error(bind + " is already in use");
        process.exit(1);
        break;
    default:
        throw error;
    }
}
