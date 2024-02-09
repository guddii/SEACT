import { Card, Form, Input, Space } from "antd";
import type { ChangeEventHandler, ReactElement } from "react";
import { useState } from "react";
import { ControlFetch } from "../ControlFetch";

const { TextArea } = Input;

interface FormReadWriteProps {
  resource: string;
}

export function FormReadWrite({ resource }: FormReadWriteProps): ReactElement {
  const [url, setUrl] = useState(resource);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setUrl(event.target.value);
  };

  return (
    <Card>
      <Form
        autoComplete="off"
        initialValues={{ resource }}
        labelCol={{ span: 4 }}
        style={{ maxWidth: "100%" }}
        wrapperCol={{ span: 20 }}
      >
        <Form.Item
          extra="The resource to be fetched"
          label="Resource"
          name="resource"
          rules={[{ required: true }, { type: "url" }]}
        >
          <Input onChange={handleChange} />
        </Form.Item>
        <Form.Item
          extra="Contents of the response body"
          label="Response"
          name="field"
        >
          <TextArea rows={8} />
        </Form.Item>
        <Form.Item>
          <Space>
            <ControlFetch key="get" method="GET" resource={url} />
            <ControlFetch key="put" method="PUT" resource={url} />
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
}
