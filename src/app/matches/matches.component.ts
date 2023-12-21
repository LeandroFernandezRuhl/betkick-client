import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { EventService } from "../service/event.service";
import { BetService } from "../service/bet.service"
import { ActivatedRoute } from "@angular/router";
import { DatePipe, Location } from "@angular/common";
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Match, Winner } from "../model";
import {  isSameWeek } from 'date-fns';

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css'],
  providers: [DatePipe]
})
export class MatchesComponent implements OnInit {
  matches: Match[] = [];
  liveMatches: Match[]=[];
  todayMatches: Match[] = [];
  weekMatches: Match[] = []
  monthMatches: Match[]=[]
  searchMatches: Match[] = [];
  competition: string = "";
  inputMatch: string = "";
  urlActual = window.location.href;
  bet1 = parseFloat((Math.random() * (4.0 - 1.0) + 1.0).toFixed(1));
  betX = parseFloat((Math.random() * (4.0 - 1.0) + 1.0).toFixed(1));
  bet2 = parseFloat((Math.random() * (4.0 - 1.0) + 1.0).toFixed(1));

  form = this.fb.group({
    matchId: [''],
    homeTeam: [''],
    awayTeam: [''],
    betOdds: [''],
    betAmount: [''],
    winner: [''],
  });

  constructor(
    private eventService: EventService,
    private fb: FormBuilder,
    private betService: BetService,
    private route: ActivatedRoute,
  ) {
    //private location: Location) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      const competitionId = id !== 0 ? id : undefined;
      this.getMatches(competitionId);
    });
  }

  search() {
    this.searchResults(this.inputMatch);
  }
  searchResults(team: string) {
    this.searchMatches.length = 0;
    let homeTeam: string = "";
    let awayTeam: string = "";
    team = team.toLowerCase();
    console.log(team);
    this.matches.forEach(element => {
      homeTeam = element.awayTeam.name.toLowerCase();
      awayTeam = element.homeTeam.name.toLowerCase();
      if (homeTeam.includes(team) || awayTeam.includes(team)) {
        this.searchMatches.push(element);
      }
    });

  }
  getMatches(competitionId?: number): void {
    this.eventService.getMatches(competitionId)
      .subscribe(matches => {
        this.matches = matches;
        this.competition = matches[1].competition.name;
        this.matches.sort((a, b) => this.compareDates(a.utcDate, b.utcDate));
        this.matches=this.matches.filter(function(match: any ){
          return match.status !='FINISHED' && match.status !='AWARED'
        })
        this.matchFilter()
      });
  }
  compareDates(date1: string, date2: string): number {
    const dateA = new Date(date1);
    const dateB = new Date(date2);
    return dateA.getTime() - dateB.getTime();
  }
  handleButtonClick(match: Match, odds: number, event: MouseEvent): void {
    let listBetsLenght: number = 0
    this.betService.listBets$.subscribe((datos) => {
      let listBets: any = datos;
      listBetsLenght = (listBets as FormArray).length;
    });
    if (listBetsLenght < 10) {
      const valores = {
        matchId: match.id.toString(),
        homeTeam: match.homeTeam.shortName,
        awayTeam: match.awayTeam.shortName,
        placedAt: null,
        betOdds: odds.toString(),
        betAmount: null,
        winner: this.whoWins(match, event),
      };
      if (valores.winner) {
        console.log(valores.winner);
        this.form.patchValue(valores);
        this.betService.addData(this.form.value);
      }
      this.form.reset();
    } else {
      //mandar alerta
    }
  }

  whoWins(match: Match, event: MouseEvent): any {
    const buttonId = (event.target as HTMLButtonElement)?.id;
    switch (buttonId) {
      case 'localWinSpan':
      case 'localWin':
        return Winner.HOME_TEAM.toString();
      case 'drawSpan':
      case 'draw':
        return Winner.DRAW.toString();
      case 'awayWinSpan':
      case 'awayWin':
        return Winner.AWAY_TEAM.toString();
    }
  }

  adjustedDate(utcDateString: string): Date {
    const utcDate = new Date(utcDateString);
    utcDate.setHours(utcDate.getHours() - 3);
    return utcDate;
  }

  matchFilter() {
    this.liveMatches=[]
    this.todayMatches = []
    this.weekMatches = []
    this.monthMatches=[]
    this.matches.forEach((match: any) => {
      if(match.status=='IN_PLAY' || match.status =='PAUSED'){
        this.liveMatches.push(match)
      }
      else if (this.isTodayMatch(match)) {
        this.todayMatches.push(match)
      }
      else if(this.isThisWeekMatch(match)){
        console.log("aca");
        
        this.weekMatches.push(match)
      }else{
        this.monthMatches.push(match)
      }
    });
    console.log(this.todayMatches);

  }

  isTodayMatch(match: Match): boolean {
    const todayDate = new Date();
    const matchDate = new Date(match.utcDate)
    return (
      todayDate.getUTCFullYear() === matchDate.getUTCFullYear() &&
      todayDate.getUTCMonth() === matchDate.getUTCMonth() &&
      todayDate.getUTCDate() === matchDate.getUTCDate()
    );
  }

  isThisWeekMatch(match: Match): boolean {
    const currentDate = new Date();
    const matchDate = new Date(match.utcDate)
    return isSameWeek(matchDate, currentDate);
  }
  /*goBack(): void {
  this.location.back();
  getTodayMatches(){
    const fechaActual = new Date();
    const fechaActualFormateada = this.datePipe.transform(fechaActual, 'yyyy-MM-dd');
    this.todayMatches=this.matches.filter(function(match:Match){
      const dia=match.utcDate.split('T')[0];
      return dia===fechaActualFormateada
    })
  }*/

  protected readonly Math = Math;
  protected readonly parseFloat = parseFloat;
}
