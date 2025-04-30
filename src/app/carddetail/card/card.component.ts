import {ChangeDetectionStrategy, Component, Input, signal,  } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import { CharacterService } from '../../Services/character.service';
import { Observable, of } from 'rxjs';


@Component({
  selector: 'app-card',
  imports: [CommonModule,MatButtonModule, MatCardModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.component.html',
  styleUrl: './card.component.css'
})
export class CardComponent {

  @Input() characterName!: Observable<string | null>;
  @Input() characterImage!: Observable<string | null>;
  @Input() characterLocation!: Observable<string | null>;
  @Input() episodeName!: Observable<string | null>;
  @Input() characterNameCoincidences!: Observable<string[] | null>;
  @Input() originPlace!: Observable<string | null>;
  @Input() selectedOriginCoincidence!: Observable<string[] | null>;





constructor(private characterService:CharacterService){}



like = signal(false);


likeIt(){
  this.like.update(value => !value);
  if(this.like()){

    console.log('LIKE')
  }else{
    console.log('DISLIKE')
  }
}

}
