import { ThemeProvider } from "@mui/material/styles";
import { GlobalStyles } from "@mui/styled-engine";
import React from "react";
import { engravedTheme } from "./engravedTheme";

export const ThemeAndStylesProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => (
  <ThemeProvider theme={engravedTheme}>
    <GlobalStyles
      styles={{
        html: {
          background: engravedTheme.palette.background.default,
        },

        body: {
          margin: 0,
          overflowY: "scroll",
        },

        a: {
          color: engravedTheme.palette.primary.main + " !important;",
          textDecoration: "none",
        },
      }}
    />
    {children}
  </ThemeProvider>
);
