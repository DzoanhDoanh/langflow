import { MarkdownField } from "@/modals/IOModal/components/chatView/chatMessage/components/edit-message";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import type { SliderSingleProps } from "antd";
import { Slider, Form, Input, Popconfirm } from "antd";

type CustomMarkdownFieldProps = {
  isAudioMessage: boolean;
  chat: any;
  isEmpty: boolean;
  chatMessage: string;
  editedFlag: React.ReactNode;
};

const formatter: NonNullable<SliderSingleProps["tooltip"]>["formatter"] = (
  value
) => `${value}%`;

export const CustomMarkdownField = ({
  isAudioMessage,
  chat,
  isEmpty,
  chatMessage,
  editedFlag,
}: CustomMarkdownFieldProps) => {
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [hasExistingFeedback, setHasExistingFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [form] = Form.useForm();

  const checkFeedback = async (message_id: string) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/get_message_comment/${message_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      if (data.comment) {
        setHasExistingFeedback(true);
      } else {
        setHasExistingFeedback(false);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setHasExistingFeedback(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (chat?.id) {
      checkFeedback(chat.id.split("-").join(""));
    }
  }, [chat?.id]);

  return (
    <>
      <MarkdownField
        isAudioMessage={isAudioMessage}
        chat={chat}
        isEmpty={isEmpty}
        chatMessage={chatMessage}
        editedFlag={editedFlag}
      />
      
      {/* Form đánh giá */}
      {!isLoading && !hasExistingFeedback && !feedbackSent && (
        <Form
          form={form}
          layout="vertical"
          className="w-full mt-4"
          initialValues={{ rating: 100, comment: "" }}
          onFinish={async (values) => {
            try {
              await fetch(
                `${
                  import.meta.env.VITE_BACKEND_URL
                }/add_score_and_comment?message_id=${chat.id
                  .split("-")
                  .join("")}&score=${values.rating}&comment=${
                  values.comment
                }`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
            } catch (err) {
              console.error("Error sending feedback:", err);
            }

            setFeedbackSent(true);
          }}
        >
          <hr className="my-2 border-border" />
          <Form.Item
            label={
              <span className="font-semibold">
                Đánh giá độ chính xác của AI:
              </span>
            }
            name="rating"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">0%</span>
              <Slider
                tooltip={{ formatter }}
                max={100}
                defaultValue={100}
                min={0}
                step={1}
                style={{ width: 250 }}
              />
              <span className="text-sm">100%</span>
            </div>
          </Form.Item>
          <Form.Item label="Nhận xét:" name="comment">
            <Input.TextArea
              rows={2}
              autoSize={{ minRows: 2, maxRows: 100 }}
              placeholder="Nhập nhận xét của bạn..."
            />
          </Form.Item>
          <Form.Item className="mb-0">
            <div className="flex justify-end w-full">
              <Popconfirm
                title="Xác nhận gửi đánh giá"
                description="Bạn có chắc chắn muốn gửi đánh giá này không?"
                onConfirm={() => form.submit()}
                okText="Có"
                cancelText="Không"
              >
                <Button type="button" variant="primary" size="xs">
                  Gửi
                </Button>
              </Popconfirm>
            </div>
          </Form.Item>
        </Form>
      )}
      
      {/* Thông báo đã đánh giá */}
      {(hasExistingFeedback || feedbackSent) && (
        <div className="mt-4 text-green-600 font-medium">
          Đã đánh giá!
        </div>
      )}
    </>
  );
};
