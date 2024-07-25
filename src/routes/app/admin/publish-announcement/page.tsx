/* eslint-disable import/no-named-as-default */
import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { useEditor } from '@tiptap/react';
import Highlight from '@tiptap/extension-highlight';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Superscript from '@tiptap/extension-superscript';
import SubScript from '@tiptap/extension-subscript';
import { Color } from '@tiptap/extension-color';
import TextStyle from '@tiptap/extension-text-style';
import { Link } from '@tiptap/extension-link';
import { RichTextEditor } from '@mantine/tiptap';
import { useState } from 'react';
import { modals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { useNavigate } from '@modern-js/runtime/router';
import PageTitle from '@/ui/component/app/PageTitle';
import { mv4RequestApi } from '@/api/mv4Client';
import { MV4RequestError } from '@/api/base';
import MV4Card from '@/ui/component/app/MV4Card';

export default function PublishAnnouncementPage() {
  const navigate = useNavigate();
  const [titleValue, setTitleValue] = useState('');
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
    ],
  });

  async function onClickPublishAnnouncement() {
    modals.openConfirmModal({
      title: '确定发布公告吗？',
      labels: { confirm: '确定', cancel: '取消' },
      onConfirm: async () => {
        if (titleValue.length === 0 || editor?.getText().length === 0) {
          notifications.show({
            message: '标题和内容均不得为空',
            color: 'red',
          });
          return;
        }
        try {
          await mv4RequestApi({
            path: '/announcement/publish-new',
            data: {
              title: titleValue,
              content: editor?.getHTML(),
            },
          });
          navigate('/app');
        } catch (e) {
          if (e instanceof Error || e instanceof MV4RequestError) {
            console.error(e);
            notifications.show({
              message: e.message,
              color: 'red',
            });
          }
        }
      },
    });
  }

  return (
    <Stack>
      <PageTitle>发布公告</PageTitle>
      <Stack gap={'sm'}>
        <MV4Card>
          <Stack gap={'md'}>
            <Stack gap={'xs'}>
              <Text size={'sm'}>标题</Text>
              <TextInput
                value={titleValue}
                onChange={e => setTitleValue(e.currentTarget.value)}
              />
              <Text size={'sm'}>正文</Text>
              <RichTextEditor editor={editor}>
                <RichTextEditor.Toolbar>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.ColorPicker
                      colors={[
                        '#25262b',
                        '#868e96',
                        '#fa5252',
                        '#e64980',
                        '#be4bdb',
                        '#7950f2',
                        '#4c6ef5',
                        '#228be6',
                        '#15aabf',
                        '#12b886',
                        '#40c057',
                        '#82c91e',
                        '#fab005',
                        '#fd7e14',
                      ]}
                    />
                    <RichTextEditor.UnsetColor />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Strikethrough />
                    <RichTextEditor.ClearFormatting />
                    <RichTextEditor.Highlight />
                    <RichTextEditor.Code />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.H1 />
                    <RichTextEditor.H2 />
                    <RichTextEditor.H3 />
                    <RichTextEditor.H4 />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Blockquote />
                    <RichTextEditor.Hr />
                    <RichTextEditor.BulletList />
                    <RichTextEditor.OrderedList />
                    <RichTextEditor.Subscript />
                    <RichTextEditor.Superscript />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Link />
                    <RichTextEditor.Unlink />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.AlignLeft />
                    <RichTextEditor.AlignCenter />
                    <RichTextEditor.AlignJustify />
                    <RichTextEditor.AlignRight />
                  </RichTextEditor.ControlsGroup>

                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Undo />
                    <RichTextEditor.Redo />
                  </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>

                <RichTextEditor.Content />
              </RichTextEditor>
            </Stack>
            <Group gap={'sm'}>
              <Button onClick={onClickPublishAnnouncement}>发布</Button>
            </Group>
          </Stack>
        </MV4Card>
      </Stack>
    </Stack>
  );
}
