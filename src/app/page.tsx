/* eslint-disable react/jsx-no-comment-textnodes */
"use client"
import { useEffect } from "react";
import { setLayers, initMap } from "../components/map";
import Image from 'next/image'
import logo from "../../public/acme-logo.svg";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Home() {

  useEffect(() => {
    initView()
  }, [])

  const COMPANY_BASE_API_URL = process.env.VITE_COMPANY_API_BASE_URL;


  async function login() {
    const username = (
      document.querySelector('input[name="username"]') as HTMLInputElement
    ).value;
    const password = (
      document.querySelector('input[name="password"]') as HTMLInputElement
    ).value;

    console.log(JSON.stringify({ username, password }));

    const loginResp = await fetch(`${COMPANY_BASE_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const { token, error } = await loginResp.json();
    if (error) {
      alert(error);
      return;
    }

    const tokenResp = await fetch(`${COMPANY_BASE_API_URL}/carto-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token,
      },
    });

    const { token: cartoToken, queries, group, error: tokenError } = await tokenResp.json();
    console.log('token', cartoToken, 'queries', queries, 'group', group, 'tokenError', tokenError);
    if (tokenError) {
      alert(tokenError);
      return;
    }

    document.querySelector<HTMLDivElement>("#login-container")!.innerHTML = `
      <div class="profile">
        ${username} - <span>${group}</span>
        <select id="query-select">
          ${queries.map((query: any, index: number) => `<option key={${index}} value="${index}">${query.id}</option>`)}
        </select>
        <button type="submit" id="logout" class="button">Logout</button>
      </div>
    `;
    document.getElementById("logout")?.addEventListener("click", initView);

    document.getElementById("query-select")?.addEventListener("change", (event: any) => {
      console.log(event?.target?.value);
      setLayers(queries[event?.target?.value], cartoToken)
    });

    setLayers(queries[0], cartoToken);
  }

  function addLoginForm() {
    document.querySelector<HTMLDivElement>("#login-container")!.innerHTML = `
        <input type="text" placeholder="Username" name="username" value="user.boston@acme.com">
        <input type="password" placeholder="Password" name="password" value="boston">
        
  <!--      <input type="text" placeholder="Username" name="username" value="user.ny@acme.com">-->
  <!--      <input type="password" placeholder="Password" name="password" value="ny">-->
        
        <button type="submit" id="login" class="button button--primary">Login</button>
    `;
    document.getElementById("login")?.addEventListener("click", login);
  }

  function initView() {
    document.getElementById("baseSetores")?.addEventListener("click", setMyLayers);
    addLoginForm();
    initMap();
  }

  async function setMyLayers() {
    console.log('asdasdasd');
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJncm91cCI6Imx1Y2FzIiwiaWF0IjoxNjk0NzM4NTk5LCJleHAiOjE2OTQ3ODE3OTl9.fjQUqm1InObGnvKJIxPBSjtBQD-4RfbzlyRXegexIpw';
    setLayers([
      {
        connection_name: 'teste',
        source: 'SELECT * FROM bigquerytest-328219.teste_gdm.municipio_V02 WHERE TRUE ',
        id: 'municipio_V02'
      }], token);
  }

  return (
    <main>
      <div className="flex justify-center bg-zinc-800 text-white h-screen">
        <div className="container">
          <header className="header">
            <Image
              src={logo}
              height="32"
              width="32"
              alt="ACME"
            />
            <div className="header__info" id="login-container"></div>
          </header>

          <div className="sidebar">
            <ul>
              <li>
                <a href="/" id="baseSetores">
                  Base de Setores censitários
                  - Upload base pop M, F, T (Pietro)
                  -  exib. mapas carto setor
                  -  carregar pop na carto do setor
                  -  indicador % F e M no setor
                  -  filtrar pop na carto do setor
                </a>
              </li>
              <li>
                <a href="/">Raio</a>
              </li>
              <li>
                <a href="/">Polígono (desenho a mão livre)</a>
              </li>
              <li>
                <a href="/">Filtrar Área</a>
              </li>
              <li> 
                <a href="/">Filtrar Ponto</a>
              </li>
              <li>
                <a href="/">Rota</a>
              </li>
              <li>
                <a href="/">Cálculo de distância</a>
              </li>
            </ul>
          </div>

          <div className="content">
            <div id="map"></div> 
            <canvas id="deck-canvas"></canvas>
          </div>
        </div>
      </div>
    </main>
  )
}

