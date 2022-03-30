import React from "react";
import { Paper, Typography } from "@mui/material";
import styled from "styled-components";

export const Section: React.FC<{ title?: string }> = ({ children, title }) => {
  return (
    <Host>
      {title ? <Title variant="h4">{title}</Title> : null}
      {children}
    </Host>
  );
};

const Host = styled(Paper)`
  margin: 20px auto;
  padding: 20px;
`;

const Title = styled(Typography)`
  font-size: inherit !important;
  margin-bottom: 20px !important;
`;
