import Markdown from "react-markdown";
import rehypeMathjax from "rehype-mathjax";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { EMPTY_OUTPUT_SEND_MESSAGE } from "@/constants/constants";
import { preprocessChatMessage } from "@/utils/markdownUtils";
import { cn } from "@/utils/utils";
import CodeTabsComponent from "../../../../../../components/core/codeTabsComponent";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { SliderSingleProps } from 'antd';
import { Slider, Form, Input } from 'antd';

type MarkdownFieldProps = {
  chat: any;
  isEmpty: boolean;
  chatMessage: string;
  editedFlag: React.ReactNode;
  isAudioMessage?: boolean;
};
const formatter: NonNullable<SliderSingleProps['tooltip']>['formatter'] = (value) => `${value}%`;
export const MarkdownField = ({
  chat,
  isEmpty,
  chatMessage,
  editedFlag,
  isAudioMessage,
}: MarkdownFieldProps) => {
  const processedChatMessage = preprocessChatMessage(chatMessage);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [form] = Form.useForm();
  return (
    <div className="w-full items-baseline gap-2">
      <Markdown
        remarkPlugins={[remarkGfm as any]}
        linkTarget="_blank"
        rehypePlugins={[rehypeMathjax, rehypeRaw]}
        className={cn(
          "markdown prose flex w-full max-w-full flex-col items-baseline text-sm font-normal word-break-break-word dark:prose-invert",
          isEmpty ? "text-muted-foreground" : "text-primary"
        )}
        components={{
          p({ node, ...props }) {
            return (
              <>
                <p className="w-fit max-w-full my-1.5 last:mb-0 first:mt-0" onClick={() => console.log({node, ...props})}>
                  {props.children}
                </p>
                {/* Form đánh giá luôn hiển thị */}
                {!feedbackSent && (
                  <Form
                    form={form}
                    layout="vertical"
                    className="w-full mt-4"
                    initialValues={{ rating: 100, comment: "" }}
                    onFinish={async (values) => {
                      console.log(values);
                      try{
                        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/add_score_and_comment?message_id=${chat.id.split('-').join('')}&score=${values.rating}&comment=${values.comment}`, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          // body: JSON.stringify({
                          //   message_id: chat.id,
                          //   score : values.rating,
                          //   comment : values.comment,
                          // }),
                        });
                        console.log(response)
                      }
                      catch(err){
                        console.error('Error sending feedback:', err);
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
                          style={{ width: 250}}
                        />
                        <span className="text-sm">100%</span>
                      </div>
                    </Form.Item>
                    <Form.Item
                      label="Nhận xét:"
                      name="comment"
                    >
                      <Input.TextArea
                        rows={2}
                        autoSize={{ minRows: 2, maxRows: 100 }}
                        placeholder="Nhập nhận xét của bạn..."
                      />
                    </Form.Item>
                    <Form.Item className="mb-0">
                      <div className="flex justify-end w-full">
                        <Button
                          type="submit"
                          variant="primary"
                          size="xs"
                        
                        >
                          Gửi 
                        </Button>
                      </div>
                    </Form.Item>
                  </Form>
                )}
                {feedbackSent && (
                  <div className="mt-4 text-green-600 font-medium">
                    Đã gửi phản hồi!
                  </div>
                )}
              </>
            );
          },
          ol({ node, ...props }) {
            return <ol className="max-w-full">{props.children}</ol>;
          },
          ul({ node, ...props }) {
            return <ul className="max-w-full mb-2">{props.children}</ul>;
          },
          pre({ node, ...props }) {
            return <>{props.children}</>;
          },
          hr({ node, ...props }) {
            return <hr className="w-full mt-3 mb-5 border-border" {...props} />;
          },
          h3({ node, ...props }) {
            return <h3 className={cn("mt-4", props.className)} {...props} />;
          },
          table: ({ node, ...props }) => {
            return (
              <div className="max-w-full overflow-hidden rounded-md border bg-muted">
                <div className="max-h-[600px] w-full overflow-auto p-4">
                  <table className="!my-0 w-full">{props.children}</table>
                </div>
              </div>
            );
          },
          code: ({ node, inline, className, children, ...props }) => {
            let content = children as string;
            if (
              Array.isArray(children) &&
              children.length === 1 &&
              typeof children[0] === "string"
            ) {
              content = children[0] as string;
            }
            if (typeof content === "string") {
              if (content.length) {
                if (content[0] === "▍") {
                  return <span className="form-modal-markdown-span"></span>;
                }

                // Specifically handle <think> tags that were wrapped in backticks
                if (content === "<think>" || content === "</think>") {
                  return <span>{content}</span>;
                }
              }

              const match = /language-(\w+)/.exec(className || "");

              return !inline ? (
                <CodeTabsComponent
                  language={(match && match[1]) || ""}
                  code={String(content).replace(/\n$/, "")}
                />
              ) : (
                <code className={className} {...props}>
                  {content}
                </code>
              );
            }
          },
        }}
      >
        {isEmpty && !chat.stream_url
          ? EMPTY_OUTPUT_SEND_MESSAGE
          : processedChatMessage}
      </Markdown>
      {editedFlag}
    </div>
  );
};
