import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDividerModule } from 'ng-zorro-antd/divider';

@Component({
  selector: 'zrgenesiscloud-contact',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    NzGridModule,
    NzCardModule,
    NzFormModule,
    NzInputModule,
    NzButtonModule,
    NzIconModule,
    NzCollapseModule,
    NzMessageModule,
    NzSelectModule,
    NzDividerModule
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm!: FormGroup;
  
  faqs = [
    {
      question: '如何下载你们的应用？',
      answer: '您可以在App Store或Google Play商店中搜索我们的应用名称，直接下载安装。也可以通过我们网站上的下载链接获取应用。'
    },
    {
      question: '产品支持哪些平台？',
      answer: '我们的应用产品支持iOS和Android平台，部分工具也提供Web版本，可以在各类主流设备上使用。'
    },
    {
      question: '如何联系技术支持？',
      answer: '您可以通过本页面的联系表单，或直接发送邮件到support@zrgenesiscloud.com获取技术支持。我们会在24小时内回复您。'
    },
    {
      question: '是否提供定制开发服务？',
      answer: '是的，我们提供软件定制开发服务，可以根据您的具体需求，定制开发专属解决方案。请通过联系表单与我们沟通具体需求。'
    },
    {
      question: '如何申请产品代理或合作？',
      answer: '我们欢迎有意向的合作伙伴，您可以发送合作申请到partner@zrgenesiscloud.com，或填写此页面的联系表单，我们的商务团队会与您联系。'
    },
    {
      question: '产品是否提供企业版本？',
      answer: '是的，我们为企业客户提供功能更强大、安全性更高的企业版本，支持定制化部署和专属服务支持。'
    }
  ];
  
  constructor(private fb: FormBuilder, private message: NzMessageService) {}
  
  ngOnInit(): void {
    this.initForm();
  }
  
  initForm(): void {
    this.contactForm = this.fb.group({
      name: [null, [Validators.required]],
      email: [null, [Validators.required, Validators.email]],
      phone: [null],
      type: ['product'],
      message: [null, [Validators.required]]
    });
  }
  
  submitForm(): void {
    if (this.contactForm.valid) {
      // 这里通常会发送表单数据到后端API
      console.log('表单提交数据: ', this.contactForm.value);
      this.message.success('消息已发送，我们会尽快回复您！');
      this.contactForm.reset({
        type: 'product'
      });
    } else {
      Object.values(this.contactForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }
}
