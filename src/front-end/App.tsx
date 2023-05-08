import { useState } from "react";
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import StorageIcon from '@mui/icons-material/Storage';
import SettingsInputHdmiIcon from '@mui/icons-material/SettingsInputHdmi';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

enum Options {
  ROOT_PATH = "rootPath",
  PORT = "port",
  FIND_PORT_START = "findPortStart",
  FIND_PORT_END = "findPortEnd",
}

function App() {
  const [rootPath, setRootPath] = useState(localStorage.getItem(Options.ROOT_PATH) || "");
  const [port, setPort] = useState(Number(localStorage.getItem(Options.PORT)) || 8000);
  const [portTaken, setPortTaken] = useState(false);
  const [findPortStart, setFindPortStart] = useState(Number(localStorage.getItem(Options.FIND_PORT_START)) || 8000);
  const [findPortEnd, setFindPortEnd] = useState(Number(localStorage.getItem(Options.FIND_PORT_END)) || 9000);
  const [serverRunning, setServerRunning] = useState(false);

  CheckPortTaken(port);

  async function CheckPortTaken(port: number) {
    const response = await (window as unknown as any).commands.portTaken(port);
    setPortTaken(response);
  }

  function UpdatePort(port: number) {
    setPort(port);
    localStorage.setItem(Options.PORT, String(port));
    CheckPortTaken(port);
  }

  async function selectDirectory() {
    const response = await (window as unknown as any).commands.selectRoot()
    setRootPath(response);
    localStorage.setItem(Options.ROOT_PATH, response);
  }

  async function changePort(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const target = event.target as HTMLInputElement;
    UpdatePort(Number(target.value));
  }

  async function changeFindPortStart(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const target = event.target as HTMLInputElement;
    setFindPortStart(Number(target.value));
    localStorage.setItem(Options.FIND_PORT_START, String(target.value));
  }

  async function changeFindPortEnd(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const target = event.target as HTMLInputElement;
    setFindPortEnd(Number(target.value));
    localStorage.setItem(Options.FIND_PORT_END, String(target.value));
  }

  async function findFreePort() {
    const response = await (window as unknown as any).commands.findFreePort(findPortStart, findPortEnd);
    UpdatePort(response);
  }

  async function startServer() {
    if (serverRunning) {
      alert("Server already running");
      return;
    }

    const response = await (window as unknown as any).commands.startServer(rootPath, port);
    setServerRunning(response);
  }

  async function stopServer() {
    if (!serverRunning) {
      alert("Server not running");
      return;
    }

    const response = await (window as unknown as any).commands.stopServer();
    setServerRunning(response);
  }

  return (
    <Container>
      <Stack spacing={2}>
        <h1>Simple Web Server</h1>

        <Box>
          <h2><StorageIcon></StorageIcon> Directory</h2>
          <TextField size="small" sx={{ width: 350, mr: 1 }} type="string" disabled value={rootPath}></TextField>
          <Button variant="contained" onClick={selectDirectory}>Select directory</Button>
        </Box>

        <Box>
          <h2><SettingsInputHdmiIcon></SettingsInputHdmiIcon> Port</h2>
          <TextField size="small" label="Port" sx={{ width: 100, mr: 8 }} type="number" onChange={changePort} value={port} error={portTaken} helperText={portTaken ? "Port in use" : ""}></TextField>
          <Button variant="contained" onClick={findFreePort}>Find port</Button>
          <TextField size="small" label="Start" sx={{ width: 100, ml: 1 }} type="number" onChange={changeFindPortStart} value={findPortStart}></TextField>
          <TextField size="small" label="End" sx={{ width: 100, ml: 1 }} type="number" onChange={changeFindPortEnd} value={findPortEnd}></TextField>
        </Box>
      </Stack>

      <Box mt={10}>
        {serverRunning
          ? <Alert severity="success">Server is running</Alert>
          : <Alert severity="warning">Server is not running</Alert>
        }
      </Box>

      <Box mt={2}>
        {serverRunning
          ? <Button fullWidth variant="contained" onClick={stopServer}>Stop server</Button>
          : <Button fullWidth variant="contained" onClick={startServer}>Start server</Button>
        }
      </Box>
    </Container >
  );
}

export default App;
