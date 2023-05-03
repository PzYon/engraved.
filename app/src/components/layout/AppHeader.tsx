import React from "react";
import { Link } from "react-router-dom";
import { Box, styled, Typography, useTheme } from "@mui/material";
import { useAppContext } from "../../AppContext";
import { Actions } from "../common/Actions";
import { AppInfoLauncher } from "../common/appInfo/AppInfoLauncher";
import { User } from "../common/User";
import { DeviceWidth, useDeviceWidth } from "../common/useDeviceWidth";
import { usePageContext } from "./pages/PageContext";
import { Typing } from "../common/Typing";
import { PulsatingDot } from "../common/PulsatingDot";
import { RefreshData } from "../common/RefreshData";

export const AppHeader: React.FC = () => {
  const { user } = useAppContext();
  const { pageTitle, pageActions } = usePageContext();
  const deviceWidth = useDeviceWidth();
  const { palette } = useTheme();

  return (
    <Host>
      <Box
        sx={{
          background: `linear-gradient(146deg, ${palette.text.primary} 0%, ${palette.primary.main} 100%)`,
          mb: 2,
        }}
      >
        <ContentWrapper sx={{ display: "flex", height: "64px" }}>
          <Link to="/" style={{ flexGrow: 1 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: "35px",
                marginTop: "-10px",
              }}
            >
              <Typing
                textToType="engraved"
                renderOnComplete={<PulsatingDot />}
              />
            </Typography>
          </Link>
          <AppInfoLauncher />
          <RefreshData />
          <Link to="/users/me">
            <User user={user} />
          </Link>
        </ContentWrapper>
      </Box>
      <ContentWrapper
        style={
          deviceWidth === DeviceWidth.Small
            ? { flexDirection: "column", alignItems: "start" }
            : null
        }
      >
        <Typography variant="h2" sx={{ flexGrow: 1, color: "primary.main" }}>
          {pageTitle ?? <>&nbsp;</>}
        </Typography>

        <Actions
          key={window.location.pathname}
          actions={pageActions}
          enableFloatingActions={true}
        />
      </ContentWrapper>
    </Host>
  );
};

const Host = styled("div")`
  margin-bottom: ${(p) => p.theme.spacing(2)};
`;

const ContentWrapper = styled("div")`
  max-width: 1200px;
  margin: auto;
  padding: 0 ${(p) => p.theme.spacing(2)};
  display: flex;
  align-items: center;

  a {
    color: ${(p) => p.theme.palette.common.white} !important;
  }
`;
