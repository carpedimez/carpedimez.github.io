from pathlib import Path
import re, json
root=Path(__file__).resolve().parent
src=(root.parent/'outputs/community_survey/居民调研问卷.md').read_text(encoding='utf8')
pattern=r'\*\*(\d+)(?:（(\d+)）)?\.\s*(.*?)\*\*（([^\n]+)）'
matches=list(re.finditer(pattern,src))
questions=[]
for i,m in enumerate(matches):
 number,sub,title,kind=m.groups()
 block=src[m.end(): matches[i+1].start() if i+1<len(matches) else src.index('## 调研者使用说明')]
 opts=[{'value':int(code),'label':label.strip()} for code,label in re.findall(r'^- □\s*(\d+)\.\s*(.+)$',block,re.M)]
 qid='Q'+number+('_'+sub if sub else '')
 q={'id':qid,'number':number+('（'+sub+'）' if sub else ''),'title':title,'kind':'text' if '开放题' in kind else ('multi' if '多选' in kind else 'single'),'options':opts}
 if qid in ['Q11','Q22']:q['max']=3
 if qid=='Q23':q['max']=2
 if qid=='Q6':q['exclusive']=[7]
 if qid=='Q11':q['exclusive']=[7]
 if qid=='Q12':q['exclusive']=[7,8]
 if qid=='Q23':q['exclusive']=[6]
 questions.append(q)
assert len(questions)==26 and questions[-1]['id']=='Q24',len(questions)
(root/'questions.js').write_text('window.SURVEY_QUESTIONS = '+json.dumps(questions,ensure_ascii=False,indent=2)+';\n',encoding='utf8')
print('Question fields:',len(questions))
