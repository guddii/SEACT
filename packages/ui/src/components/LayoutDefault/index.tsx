import type { ReactElement, ReactNode } from "react";
import React from "react";
import { Flex, Layout, Typography } from "antd";
import type { Metadata } from "next";
import { ControlLogin } from "../ControlLogin";
import { BreadcrumbDefault } from "../Breadcrumb";

const { Content } = Layout;

const { Title, Paragraph } = Typography;

interface LayoutDefaultProps {
  children: ReactNode;
  metadata: Metadata;
}

export function LayoutDefault({
  children,
  metadata,
}: LayoutDefaultProps): ReactElement {
  return (
    <Layout style={{ height: "100vh" }}>
      <Content style={{ margin: "0 16px" }}>
        <Flex
          align="center"
          justify="space-between"
          style={{ margin: "16px 0" }}
        >
          <BreadcrumbDefault metadata={metadata} />
          <ControlLogin />
        </Flex>

        <Title>{String(metadata.title)}</Title>

        {metadata.description ? (
          <Paragraph>{metadata.description}</Paragraph>
        ) : null}

        {children}
      </Content>
    </Layout>
  );
}
