import { Card, Form, Input, Space } from "antd";
import type { ReactElement } from "react";
import { ControlFetch } from "../ControlFetch";

const { TextArea } = Input;

interface FormReadWriteProps {
  ressource: string;
}

export function FormReadWrite({ ressource }: FormReadWriteProps): ReactElement {
  return (
    <Card>
      <Form
        autoComplete="off"
        labelCol={{ span: 1 }}
        style={{ maxWidth: "100%" }}
        wrapperCol={{ span: 23 }}
      >
        <Form.Item extra={ressource} label="WebId" name="field">
          <TextArea rows={8} />
        </Form.Item>
        <Form.Item>
          <Space>
            <ControlFetch key="get" method="GET" ressource={ressource} />
            <ControlFetch key="put" method="PUT" ressource={ressource} />
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
