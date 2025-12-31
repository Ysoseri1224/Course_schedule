import { Card, Alert, Typography, Divider } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

function NotificationSettings() {
  return (
    <div className="p-6 max-w-5xl">
      <Title level={2}>推送提醒功能分析</Title>
      
      <Alert
        message="功能设计中"
        description="该功能正在进行技术可行性分析和方案设计"
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        className="mb-6"
      />

      <Card title="功能需求" className="mb-4">
        <Paragraph>
          <ul>
            <li>学生与微信群一对一绑定</li>
            <li>上课前自动推送提醒消息到对应群</li>
            <li>排课时关联教室信息</li>
            <li>上课期间教室状态显示为"占用中"</li>
          </ul>
        </Paragraph>
      </Card>

      <Card title="技术方案分析" className="mb-4">
        <Title level={4}>方案一：企业微信群机器人（推荐）</Title>
        <Paragraph>
          <Text strong>优点：</Text>
          <ul>
            <li>✅ 官方API，稳定可靠</li>
            <li>✅ 配置简单，每个群创建一个Webhook即可</li>
            <li>✅ 无需额外认证，直接HTTP POST发送消息</li>
            <li>✅ 支持文本、图片、文件等多种消息类型</li>
          </ul>
          <Text strong>缺点：</Text>
          <ul>
            <li>⚠️ 需要使用企业微信（不是个人微信）</li>
            <li>⚠️ 每个群需要手动添加机器人并获取Webhook</li>
          </ul>
          <Text strong>实现难度：</Text>
          <Text type="success">★★☆☆☆（简单）</Text>
        </Paragraph>

        <Divider />

        <Title level={4}>方案二：微信公众号模板消息</Title>
        <Paragraph>
          <Text strong>优点：</Text>
          <ul>
            <li>✅ 官方API，稳定</li>
            <li>✅ 可以发送到个人微信</li>
            <li>✅ 支持模板消息，格式统一</li>
          </ul>
          <Text strong>缺点：</Text>
          <ul>
            <li>❌ 需要认证公众号（需要企业资质）</li>
            <li>❌ 用户需要关注公众号</li>
            <li>❌ 需要用户授权获取OpenID</li>
            <li>❌ 模板消息有条数限制</li>
          </ul>
          <Text strong>实现难度：</Text>
          <Text type="warning">★★★★☆（较难）</Text>
        </Paragraph>

        <Divider />

        <Title level={4}>方案三：第三方微信群机器人（钉钉/飞书风格）</Title>
        <Paragraph>
          <Text strong>优点：</Text>
          <ul>
            <li>✅ 类似企业微信群机器人</li>
            <li>✅ 配置简单</li>
          </ul>
          <Text strong>缺点：</Text>
          <ul>
            <li>❌ 微信个人群不支持官方机器人</li>
            <li>❌ 第三方方案存在封号风险</li>
            <li>❌ 需要额外付费或不稳定</li>
          </ul>
          <Text strong>实现难度：</Text>
          <Text type="danger">★★★★★（困难且有风险）</Text>
        </Paragraph>
      </Card>

      <Card title="推荐实现方案" type="inner">
        <Title level={4}>阶段一：企业微信群机器人（即时可用）</Title>
        <Paragraph>
          <ol>
            <li><Text strong>数据库扩展：</Text>
              <ul>
                <li>students表添加字段：wechat_webhook_url（群机器人Webhook）</li>
                <li>schedules表添加字段：classroom_id（关联教室）</li>
              </ul>
            </li>
            <li><Text strong>定时任务服务：</Text>
              <ul>
                <li>使用Node.js的node-cron实现定时检查</li>
                <li>每5分钟扫描未来30分钟内的课程</li>
                <li>通过Webhook发送提醒消息</li>
              </ul>
            </li>
            <li><Text strong>消息格式：</Text>
              <pre className="bg-gray-100 p-3 rounded mt-2">
{`上课提醒
学员：张三
科目：Writing
教师：Emma老师
时间：今天 14:00-16:00
教室：101
请准时到达教室上课！`}
              </pre>
            </li>
            <li><Text strong>教室占用状态：</Text>
              <ul>
                <li>课表页面实时查询：该时段该教室是否被占用</li>
                <li>添加/编辑课程时检查教室冲突</li>
              </ul>
            </li>
          </ol>
        </Paragraph>

        <Divider />

        <Title level={4}>阶段二：功能增强（可选）</Title>
        <Paragraph>
          <ul>
            <li>消息历史记录（记录已发送的提醒）</li>
            <li>手动重发功能</li>
            <li>测试发送功能（验证Webhook是否有效）</li>
            <li>消息模板自定义</li>
            <li>提前时间可配置（如提前15/30/60分钟）</li>
          </ul>
        </Paragraph>
      </Card>

      <Card title="开发工作量评估" className="mt-4">
        <Paragraph>
          <ul>
            <li><Text strong>后端开发：</Text>2-3天
              <ul>
                <li>数据库扩展和迁移</li>
                <li>Webhook发送服务</li>
                <li>定时任务调度器</li>
                <li>教室冲突检测逻辑</li>
              </ul>
            </li>
            <li><Text strong>前端开发：</Text>1-2天
              <ul>
                <li>学员信息添加Webhook配置</li>
                <li>排课界面添加教室选择</li>
                <li>推送设置页面</li>
                <li>消息记录查看</li>
              </ul>
            </li>
            <li><Text strong>测试调试：</Text>1天</li>
          </ul>
          <Text strong>总计：4-6天</Text>
        </Paragraph>
      </Card>

      <Alert
        message="下一步建议"
        description="如果确定使用企业微信群机器人方案，我可以立即开始实现。如果需要其他方案，请告知具体需求。"
        type="success"
        showIcon
        className="mt-4"
      />
    </div>
  );
}

export default NotificationSettings;
