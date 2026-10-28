@echo off
rem Runs the Atropos status line with the Node.js built into Atropos.exe, so Node.js need not be installed.
set ELECTRON_RUN_AS_NODE=1
"%~dp0..\..\Atropos.exe" "%~dp0index.mjs"
