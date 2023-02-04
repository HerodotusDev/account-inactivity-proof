import { css, Global } from "@emotion/react";

export const globalStyles = (
  <Global
    styles={css`
      html,
      body {
        padding: 0;
        margin: 0;
        background: black;

        min-height: 100%;
        box-sizing: border-box;

        font-family: Helvetica, Arial, sans-serif;
        color: white;
      }
    `}
  />
);
