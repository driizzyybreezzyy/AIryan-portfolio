// ==UserScript==
// @name         Overleaf to Portfolio 1-Click Sync
// @namespace    https://aryan-portfolio-888.vercel.app/
// @version      1.0
// @description  Adds a 1-click button inside Overleaf to push your resume directly to your portfolio GitHub repo
// @author       Aryan Bhavsar
// @match        https://www.overleaf.com/project/*
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(function () {
  'use strict';

  const GITHUB_REPO = 'driizzyybreezzyy/AIryan-portfolio';
  const FILE_PATH = 'resume/main.tex';

  function getGitHubToken() {
    let token = GM_getValue('gh_token');
    if (!token) {
      token = prompt(
        'Enter your GitHub Personal Access Token (classic, with repo scope):\nThis is stored locally in your browser to push changes.'
      );
      if (token) GM_setValue('gh_token', token.trim());
    }
    return token;
  }

  function getLatexContent() {
    // 1. Try modern CodeMirror editor
    const cm = document.querySelector('.cm-content');
    if (cm && cm.cmView && cm.cmView.view) {
      return cm.cmView.view.state.doc.toString();
    }
    // 2. Try ACE editor
    if (window.ace && typeof window.ace.edit === 'function') {
      try {
        const editor = window.ace.edit('editor');
        if (editor) return editor.getValue();
      } catch (e) {}
    }
    // 3. Fallback to selecting visible code text or prompt
    return null;
  }

  async function pushToGitHub(content) {
    const token = getGitHubToken();
    if (!token) {
      alert('GitHub Token required to sync.');
      return;
    }

    const btn = document.getElementById('sync-to-portfolio-btn');
    if (btn) btn.innerText = '⏳ Syncing...';

    // 1. Get current file SHA if it exists
    const getUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
    GM_xmlhttpRequest({
      method: 'GET',
      url: getUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
      onload: function (res) {
        let sha = null;
        if (res.status === 200) {
          const data = JSON.parse(res.responseText);
          sha = data.sha;
        }

        // 2. PUT updated content (base64 encoded)
        const putUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/${FILE_PATH}`;
        const payload = {
          message: 'docs(resume): update resume from Overleaf [trigger-sync]',
          content: btoa(unescape(encodeURIComponent(content))),
          branch: 'main',
        };
        if (sha) payload.sha = sha;

        GM_xmlhttpRequest({
          method: 'PUT',
          url: putUrl,
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
          },
          onload: function (putRes) {
            if (putRes.status === 200 || putRes.status === 201) {
              if (btn) btn.innerText = '✅ Synced to Portfolio!';
              setTimeout(() => {
                if (btn) btn.innerText = '⚡ Sync to Portfolio';
              }, 4000);
              alert(
                '🚀 Success! Updated resume pushed to GitHub.\nGitHub Action will now compile the PDF and update your live portfolio on Vercel.'
              );
            } else {
              if (btn) btn.innerText = '❌ Sync Failed';
              alert('Error pushing to GitHub: ' + putRes.responseText);
            }
          },
          onerror: function (err) {
            if (btn) btn.innerText = '❌ Error';
            alert('Network error connecting to GitHub: ' + JSON.stringify(err));
          },
        });
      },
      onerror: function (err) {
        if (btn) btn.innerText = '❌ Error';
        alert('Network error checking GitHub file: ' + JSON.stringify(err));
      },
    });
  }

  function addSyncButton() {
    if (document.getElementById('sync-to-portfolio-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'sync-to-portfolio-btn';
    btn.innerText = '⚡ Sync to Portfolio';
    btn.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: #1FB257;
      color: #0A0F0C;
      font-weight: bold;
      border: 1px solid #E9C46A;
      border-radius: 8px;
      padding: 10px 16px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.4);
      cursor: pointer;
      font-family: sans-serif;
      font-size: 13px;
      transition: all 0.2s ease;
    `;

    btn.onmouseover = () => (btn.style.transform = 'scale(1.05)');
    btn.onmouseout = () => (btn.style.transform = 'scale(1)');

    btn.onclick = () => {
      const content = getLatexContent();
      if (!content) {
        alert(
          'Could not automatically detect editor text. Please make sure main.tex is open in the editor.'
        );
        return;
      }
      pushToGitHub(content);
    };

    document.body.appendChild(btn);
  }

  // Poll for editor load
  const interval = setInterval(() => {
    if (document.querySelector('.cm-content') || document.querySelector('.ace_editor')) {
      addSyncButton();
      clearInterval(interval);
    }
  }, 1000);
})();
