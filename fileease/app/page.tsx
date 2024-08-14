"use client";
import React from "react";
import Image from "next/image";
import axios from "axios";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { IoMdArrowRoundBack } from "react-icons/io";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import { useEffect, useRef, useState } from "react";
import { FaPlayCircle } from "react-icons/fa";
import { FaFolder } from "react-icons/fa";
import { FaDownload } from "react-icons/fa";
import { FaFile } from "react-icons/fa";
export default function Home() {
  const [path, setpath] = useState("");
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const [directories, setdirectories] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [source, setsource] = useState("");
  const videoRef = useRef(null);
  const videoExtensions = new Set([
    ".mp4",
    ".avi",
    ".mkv",
    ".mov",
    ".flv",
    ".wmv",
    ".webm",
  ]);
  interface DirectoryProps {
    data: string;
  }
  const style = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    // width: "60vw",
    // minWidth: "550px",
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
  };
  useEffect(() => {
    console.log(path);
    const call = async () => {
      const res = await axios.get(`http://192.168.1.2:4000/file?path=${path}`);

      setdirectories(res.data);
    };
    call();
  }, []);
  const searchfolder = async (path) => {
    const res = await axios.get(`http://192.168.1.2:4000/file?path=${path}`);

    setdirectories(res.data);
  };
  const download = async (c: any) => {
    try {
      const response = await axios.get(
        `http://192.168.1.2:4000/download?path=${c}`,
        {
          responseType: "blob",
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = c;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading the file:", error);
    }
  };
  const hnadleback = async () => {
    const res = await axios.get(`http://192.168.1.2:4000/back`);
    console.log(res.data);

    setdirectories(res.data);
  };
  const isVideoFile = (filename: string): boolean => {
    const extension = filename
      .substring(filename.lastIndexOf("."))
      .toLowerCase();
    return videoExtensions.has(extension);
  };
  const Directory = ({ data }: DirectoryProps) => {
    const check = /\.[^\/.]+$/.test(data);
    const isVideo = check && isVideoFile(data);
    if (check) {
      return (
        <div className="  text-[#36ff86] w-full text-wrap h-max flex items-center gap-5 py-4 relative ">
          {isVideo ? (
            <>
              <FaPlayCircle size={"1.5rem"} />
              <p className="filename max-[685px]:text-xl text-base text-slate-200 hover:cursor-pointer">
                {data.length > 30 ? `${data.substring(0, 30)}....` : data}
              </p>
            </>
          ) : (
            <>
              <FaFile size={"1.8rem"} />
              <p className="filename max-[685px]:text-xl text-base text-slate-200 hover:cursor-pointer">
                {data.length > 34 ? `${data.substring(0, 34)}....` : data}
              </p>
            </>
          )}
          {/* <p className="filename text-xl text-slate-200 hover:cursor-pointer">
            {data.length > 34 ? `${data.substring(0, 34)}....` : data}
          </p> */}
          <div className=" flex justify-between items-center absolute right-3 h-full gap-2 ">
            {isVideo && (
              <button
                onClick={() => {
                  setsource(`http://192.168.1.2:4000/file?path=${data}`);
                  handleOpen();
                }}
                className=" bg-purple-400 text-slate-100 w-max px-2 py-1 text-lg gap-2 rounded-full flex items-center font-semibold"
              >
                <FaPlayCircle size={"1.7rem"} />
                Play
              </button>
            )}
            <button
              onClick={() => download(data)}
              className=" text-blue-400  text-sm w-max px-2 py-1 gap-2 rounded-full flex items-center"
            >
              <FaDownload size={"1.7rem"} />
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div
          onClick={() => searchfolder(data)}
          className="  text-[#36b2ff] w-full text-wrap flex items-center gap-5 py-4 "
        >
          <FaFolder size={"1.8rem"} />
          <p className=" max-[685px]:text-xl text-base text-slate-200 hover:cursor-pointer">
            {data}
          </p>
        </div>
      );
    }
  };
  return (
    <main className="flex relative min-h-screen w-full flex-col items-start justify-between px-20 py-12 max-[685px]:px-0  bg-black">
      <div className=" fixed  top-0 left-0 w-full bg-red-500 py-2 z-30">
        <button
          onClick={hnadleback}
          className=" w-max py-1 text-xl px-2 rounded flex justify-center items-center gap-2"
        >
          <IoMdArrowRoundBack size={"1.5rem"} />
          Back
        </button>
      </div>
      <div className="flex flex-col  w-[46%] min-w-[520px] max-[685px]:w-full max-[685px]:pl-4 ">
        {directories && directories.map((c) => <Directory data={c} />)}
      </div>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="  w-screen ">
          <div className=" w-full h-full">
            {source && (
              <video className=" w-full h-full" src={source} controls></video>
            )}
          </div>
        </Box>
      </Modal>
    </main>
  );
}
