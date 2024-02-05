import { App, Button, Form, Input, Modal, Space } from "antd";
import type { ReactElement } from "react";
import { useState } from "react";
import { STORAGE, isSuccessfulResponse, setValuesToForm } from "@seact/core";
import { useIdentity } from "../../contexts/IdentityContext";

export function ControlClaim(): ReactElement {
  const { message } = App.useApp();
  const { webId, storage } = useIdentity();
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReloadModalOpen, setIsReloadModalOpen] = useState(false);
  const [form] = Form.useForm();

  const showModal = (): void => {
    setIsModalOpen(true);
  };

  const handleOk = (): void => {
    form.submit();
  };

  const handleCancel = (): void => {
    setIsModalOpen(false);
  };

  const schedule = (values: Record<string, string>): void => {
    setIsLoadingSchedule(true);

    const formData = setValuesToForm(values);

    void fetch("/api/claim/schedule", {
      method: "PUT",
      body: formData,
    })
      .then((res) => {
        if (isSuccessfulResponse(res)) {
          void message.open({
            type: "success",
            content: `Successfully claimed ${String(formData.get(STORAGE))}`,
          });
          setIsModalOpen(false);
          setIsReloadModalOpen(true);
        } else {
          void message.open({
            type: "error",
            content: `Could not claim ${String(formData.get(STORAGE))}`,
          });
        }
      })
      .finally(() => {
        setIsLoadingSchedule(false);
      });
  };

  const handleReloadOk = () => {
    setIsReloadModalOpen(false);
    location.reload();
  };

  const handleReloadCancel = () => {
    setIsReloadModalOpen(false);
  };

  return (
    <Space>
      <Modal
        onCancel={handleCancel}
        onOk={handleOk}
        open={isModalOpen}
        title="Claim Access Logs"
      >
        <Form form={form} initialValues={{ storage }} onFinish={schedule}>
          <Form.Item
            label="Storage"
            name={STORAGE}
            rules={[{ required: true }, { type: "url" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        onCancel={handleReloadCancel}
        onOk={handleReloadOk}
        open={isReloadModalOpen}
        title="Reload"
      >
        <p>
          After claiming the logs, it is necessary to reload the contents of
          this page. Click OK to continue.
        </p>
      </Modal>
      <Button disabled={!webId} loading={isLoadingSchedule} onClick={showModal}>
        Claim Access Logs
      </Button>
    </Space>
  );
}
