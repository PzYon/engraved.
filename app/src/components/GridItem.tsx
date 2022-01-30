import React from "react";
import { Card, CardContent, Grid, styled } from "@mui/material";
import { Link } from "react-router-dom";

export const GridItem: React.FC<{
  key: string;
  targetUrl: string;
}> = ({ children, key, targetUrl }) => {
  return (
    <Grid item xs={6} sm={4} key={key}>
      <StyledLink to={targetUrl}>
        <Card>
          <CardContent>{children}</CardContent>
        </Card>
      </StyledLink>
    </Grid>
  );
};

const StyledLink = styled(Link)({
  textDecoration: "none",
});
