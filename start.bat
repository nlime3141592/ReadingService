@echo off
start cmd /c "echo Press CTRL+C to closing server. && cd %~dp0/WebServer && node %~dp0/WebServer/main.js"