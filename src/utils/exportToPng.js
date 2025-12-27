import html2canvas from 'html2canvas';

export async function exportToPng(type, name, weekStart, schedules) {
  const element = document.getElementById('schedule-export-area');
  
  if (!element) {
    console.error('Schedule export area not found');
    return;
  }

  try {
    // 保存原始样式
    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;
    
    // 临时移除高度限制，让内容完全展开
    element.style.height = 'auto';
    element.style.overflow = 'visible';
    
    // 微调单元格文字垂直居中
    const cells = element.querySelectorAll('.schedule-td-cell');
    cells.forEach(cell => {
      cell.style.verticalAlign = 'middle';
      cell.style.lineHeight = '1.4';
      cell.style.paddingTop = '2px';
      cell.style.paddingBottom = '6px';
    });
    
    // 微调汇总行文字上移3px
    const summaryCell = element.querySelector('.schedule-summary-cell');
    if (summaryCell) {
      summaryCell.style.paddingTop = '5px';
      summaryCell.style.paddingBottom = '11px';
    }
    
    // 等待重绘
    await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true,
      allowTaint: true,
    });
    
    // 恢复原始样式
    element.style.height = originalHeight;
    element.style.overflow = originalOverflow;
    cells.forEach(cell => {
      cell.style.verticalAlign = '';
      cell.style.lineHeight = '';
      cell.style.paddingTop = '';
      cell.style.paddingBottom = '';
    });
    if (summaryCell) {
      summaryCell.style.paddingTop = '';
      summaryCell.style.paddingBottom = '';
    }

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      const weekRange = weekStart.replace(/-/g, '.');
      let filename = '';
      
      if (type === 'student') {
        filename = `${name}-一对一雅思课程表-${weekRange}.png`;
      } else if (type === 'teacher') {
        filename = `${name}-一对一排班表-${weekRange}.png`;
      } else {
        filename = `一周总课表-${weekRange}.png`;
      }
      
      link.download = filename;
      link.href = url;
      link.click();
      
      URL.revokeObjectURL(url);
    }, 'image/png');
  } catch (error) {
    console.error('Export failed:', error);
    throw error;
  }
}
