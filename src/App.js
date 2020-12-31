import React, { useEffect, useState } from "react";
import axios from "axios";
import { transpose } from "chord-transposer";

export default function App() {
  const [form, setForm] = useState({ url: "" });
  const [url, setUrl] = useState();
  const [key, setKey] = useState("");
  const [html, setHtml] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUrl(params.get("u"));

    if (params.get("u")) {
      getContentFromURL(params.get("u"));
    }
  }, []);

  async function getContentFromURL(url) {
    try {
      const data = (await axios.post("/api/cipher?u=" + url)).data;

      const doc = document.createElement("html");
      doc.innerHTML = data;

      const removeElements = doc.querySelectorAll(
        ".t3, .tab_el, .tooltip--composer, .cifra-creditos, .sh, .containerExibitions"
      );
      removeElements.forEach((el) => el.parentNode.removeChild(el));

      const div = doc.querySelectorAll(".g-side-ad");

      setHtml(div[0].outerHTML);
    } catch (error) {
      setHtml(error);
    }
  }

  async function changeTone(semitones) {
    const elements = document.querySelectorAll("#cifra_tom, pre");

    elements.forEach(function (entry) {
      const temp = transpose(entry.textContent)
        .up(semitones)
        .tokens.map((token) =>
          token.map((line) =>
            typeof line === "object" ? `<b>${line.toString()}</b>` : line
          )
        );
      const teste = transpose(temp);

      entry.innerHTML = teste;
    });
  }

  async function setTone(value) {
    try {
      const elements = document.querySelectorAll("pre, #cifra_tom");

      elements.forEach(function (entry) {
        const temp = transpose(entry.textContent)
          .toKey(value)
          .tokens.map((token) =>
            token.map((line) =>
              typeof line === "object" ? `<b>${line.toString()}</b>` : line
            )
          );
        const teste = transpose(temp);

        entry.innerHTML = teste;
      });
    } catch (error) {
      setHtml(error);
    }
  }

  function onChangeInputUrl(event) {
    setForm({ ...form, url: event.target.value });
  }

  function onSubmitFormUrl(event) {
    event.preventDefault();

    if (form.url) {
      window.location.href = `${window.location.origin}/?u=${form.url}`;
    }
  }

  function onChangeInputKey(event) {
    setKey(event.target.value);

    if (event.target.value) {
      setTone(event.target.value);
    }
  }

  return (
    <>
      <form onSubmit={onSubmitFormUrl}>
        <input value={form.url} onChange={onChangeInputUrl} />
        <button>Send</button>
      </form>

      {url && (
        <>
          <button onClick={(e) => changeTone(-1)}>-</button>
          <input value={key} onChange={onChangeInputKey} />
          <button onClick={(e) => changeTone(1)}>+</button>

          <div dangerouslySetInnerHTML={{ __html: html }}></div>
        </>
      )}
    </>
  );
}
